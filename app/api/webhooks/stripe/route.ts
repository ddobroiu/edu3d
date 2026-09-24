import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { addCredits } from "@/lib/credits";
import { issueInvoiceForPurchase } from "@/lib/invoicing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook neconfigurat." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Semnatura se verifica pe body-ul brut, deci nu folosim req.json() aici.
    const payload = await req.text();
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("[stripe/webhook] semnatura invalida:", error);
    return NextResponse.json({ error: "Semnatura invalida." }, { status: 400 });
  }

  try {
    // Contul Stripe e comun mai multor proiecte: doar platile edu3d
    const project = (event.data.object as { metadata?: Record<string, string> | null }).metadata?.project;
    if (project !== "edu3d") {
      return NextResponse.json({ received: true, ignored: project ?? "untagged" });
    }

    if (event.type === "checkout.session.completed") {
      const checkout = event.data.object as Stripe.Checkout.Session;

      if (checkout.payment_status === "paid") {
        const purchaseId = checkout.metadata?.purchaseId || checkout.client_reference_id;
        const userId = checkout.metadata?.userId;
        const credits = Number(checkout.metadata?.credits || 0);

        if (purchaseId && userId && credits > 0) {
          // updateMany pe status PENDING face operatia idempotenta: daca Stripe
          // retrimite evenimentul, a doua oara nu mai adaugam creditele.
          const claimed = await prisma.purchase.updateMany({
            where: { id: purchaseId, status: "PENDING" },
            data: { status: "COMPLETED", completedAt: new Date() },
          });

          if (claimed.count > 0) {
            await addCredits(
              userId,
              credits,
              "PURCHASE",
              `Achizitie ${credits} credite`,
              purchaseId
            );
            console.log(`[stripe/webhook] ${credits} credite adaugate pentru ${userId}`);

            // Factura se emite dupa credite: daca emiterea pica, clientul are
            // deja ce a platit, iar eroarea ramane inregistrata pe achizitie.
            await issueInvoiceForPurchase(purchaseId, checkout.customer_details);
          }
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const checkout = event.data.object as Stripe.Checkout.Session;
      const purchaseId = checkout.metadata?.purchaseId || checkout.client_reference_id;
      if (purchaseId) {
        await prisma.purchase.updateMany({
          where: { id: purchaseId, status: "PENDING" },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] procesare esuata:", error);
    // 500 face Stripe sa reincerce, ceea ce este exact ce vrem.
    return NextResponse.json({ error: "Procesare esuata." }, { status: 500 });
  }
}
