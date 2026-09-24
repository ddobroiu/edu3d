import { prisma } from "./db";
import { COMPANY } from "./company";
import { createInvoice, oblioConfigured } from "./oblio";

/**
 * Emite factura pentru o achizitie si o salveaza pe randul din baza.
 *
 * Este apelata din webhookul Stripe, dupa ce creditele au fost deja adaugate.
 * Orice esec este inregistrat in `invoiceError`, dar nu opreste plata: clientul
 * si-a primit creditele, iar factura poate fi reluata.
 */
/** Datele cumparatorului colectate de pagina de plata Stripe (nume, adresa, CUI). */
export type StripeBuyer = {
  name?: string | null;
  business_name?: string | null;
  email?: string | null;
  address?: { line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; country?: string | null } | null;
  tax_ids?: { value: string | null }[] | null;
} | null;

export async function issueInvoiceForPurchase(purchaseId: string, buyer: StripeBuyer = null) {
  if (!oblioConfigured()) {
    console.warn("[facturare] Oblio nu este configurat; se sare peste emitere.");
    return null;
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      user: {
        select: { name: true, email: true, schoolName: true, billingDetails: true },
      },
    },
  });

  if (!purchase) return null;

  // Emisa deja: nu dublam factura daca Stripe retrimite evenimentul.
  if (purchase.invoiceNumber) return purchase;

  const billing = purchase.user.billingDetails;

  // Datele de pe pagina de plata Stripe au prioritate: clientul nu mai completeaza alt formular.
  const stripeAddress = buyer?.address;
  if (stripeAddress?.city || stripeAddress?.line1) {
    const taxId = buyer?.tax_ids?.[0]?.value;
    return emit(purchaseId, purchase, {
      name: buyer?.business_name || buyer?.name || purchase.user.name || purchase.user.email || "Client",
      cif: taxId || undefined,
      address: [stripeAddress.line1, stripeAddress.line2].filter(Boolean).join(", "),
      city: stripeAddress.city || "",
      state: stripeAddress.state || stripeAddress.city || "",
      country: (stripeAddress.country || "RO").toUpperCase(),
      email: buyer?.email || purchase.user.email || undefined,
    });
  }

  // Fara date de facturare completate nu putem emite o factura corecta.
  if (!billing) {
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        invoiceError:
          "Lipsesc datele de facturare. Clientul trebuie sa le completeze in cont, apoi factura poate fi reluata.",
      },
    });
    return purchase;
  }

  const isCompany = billing.type === "company" && Boolean(billing.companyName);
  const clientName = isCompany
    ? billing.companyName!
    : [billing.firstName, billing.lastName].filter(Boolean).join(" ") ||
      purchase.user.name ||
      purchase.user.email ||
      "Client";

  return emit(purchaseId, purchase, {
    name: clientName,
    cif: isCompany ? billing.cui ?? undefined : undefined,
    rc: isCompany ? billing.regCom ?? undefined : undefined,
    address: billing.address,
    city: billing.city,
    state: billing.county || billing.city,
    country: billing.country || "RO",
    email: purchase.user.email ?? undefined,
  });
}

async function emit(
  purchaseId: string,
  purchase: { credits: number; amount: number; currency: string },
  client: Parameters<typeof createInvoice>[0]
) {
  try {
    const invoice = await createInvoice(
      client,
      [
        {
          name: `${COMPANY.brand} - ${purchase.credits} credite`,
          price: purchase.amount,
          quantity: 1,
        },
      ],
      purchase.currency
    );

    return await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        invoiceSeries: invoice.seriesName,
        invoiceNumber: invoice.number,
        invoiceUrl: invoice.link,
        invoiceError: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[facturare] emitere esuata pentru", purchaseId, message);

    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { invoiceError: message.slice(0, 500) },
    });
    return purchase;
  }
}
