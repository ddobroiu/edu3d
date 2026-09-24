import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const billing = await prisma.billingDetails.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ billing });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const type = body.type === "company" ? "company" : "personal";

  const text = (value: unknown) => String(value ?? "").trim();
  const data = {
    type,
    firstName: type === "personal" ? text(body.firstName) : null,
    lastName: type === "personal" ? text(body.lastName) : null,
    companyName: type === "company" ? text(body.companyName) : null,
    cui: type === "company" ? text(body.cui) || null : null,
    regCom: type === "company" ? text(body.regCom) || null : null,
    address: text(body.address),
    city: text(body.city),
    county: text(body.county) || null,
    country: text(body.country) || "RO",
    zip: text(body.zip) || null,
  };

  // Campurile obligatorii pe o factura din Romania.
  if (!data.address || !data.city) {
    return NextResponse.json({ error: "Adresa si localitatea sunt obligatorii." }, { status: 400 });
  }
  if (type === "company" && (!data.companyName || !data.cui)) {
    return NextResponse.json(
      { error: "Pentru firma, denumirea si CUI-ul sunt obligatorii." },
      { status: 400 }
    );
  }
  if (type === "personal" && (!data.firstName || !data.lastName)) {
    return NextResponse.json({ error: "Numele si prenumele sunt obligatorii." }, { status: 400 });
  }

  const billing = await prisma.billingDetails.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json({ billing });
}
