import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPackage, totalCredits } from "@/lib/packages";
import { baseUrl, getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const body = await req.json();
  const pkg = getPackage(String(body.packageId || ""));
  if (!pkg) {
    return NextResponse.json({ error: "Pachetul nu exista." }, { status: 400 });
  }

  const credits = totalCredits(pkg);

  try {
    // Inregistram intentia de plata inainte de redirect, ca webhook-ul sa aiba
    // ce actualiza chiar daca utilizatorul inchide tabul dupa ce plateste.
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        packageId: pkg.id,
        amount: pkg.price,
        credits,
        currency: "RON",
        status: "PENDING",
      },
      select: { id: true },
    });

    // Vizitatorul din tracking-ul mydashboard.ro, ca vanzarea sa fie legata de sursa vizitei
    const vid = /(?:^|; )_md_vid=([a-f0-9]{32})/.exec(req.headers.get("cookie") || "")?.[1];

    const checkout = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Numele, adresa si (pentru firme) CUI-ul pentru factura le cere Stripe pe pagina de plata
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      payment_intent_data: { metadata: { project: "edu3d", purchaseId: purchase.id, ...(vid && { md_vid: vid }) } },
      client_reference_id: purchase.id,
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "ron",
            unit_amount: Math.round(pkg.price * 100),
            product_data: {
              name: `edu3d - pachetul ${pkg.name}`,
              description: `${credits} credite (aproximativ ${Math.floor(credits / 10)} creatii 3D)`,
            },
          },
        },
      ],
      metadata: {
        project: "edu3d",
        ...(vid && { md_vid: vid }),
        purchaseId: purchase.id,
        userId: session.user.id,
        credits: String(credits),
        packageId: pkg.id,
      },
      success_url: `${baseUrl()}/tarife/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl()}/tarife?anulat=1`,
    });

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { stripeSessionId: checkout.id },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    return NextResponse.json({ error: "Nu am putut deschide pagina de plata." }, { status: 500 });
  }
}
