import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_CHILDREN = 12; // suficient si pentru un profesor care isi trece toata clasa

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const children = await prisma.childProfile.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      avatar: true,
      birthYear: true,
      createdAt: true,
      _count: { select: { generations: true } },
    },
  });

  return NextResponse.json({ children });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name || "").trim();
  const avatar = String(body.avatar || "fox").trim();
  const birthYear = body.birthYear ? Number(body.birthYear) : null;
  const pin = String(body.pin || "").trim();

  if (name.length < 2 || name.length > 40) {
    return NextResponse.json({ error: "Numele trebuie sa aiba intre 2 si 40 de caractere." }, { status: 400 });
  }
  if (birthYear !== null) {
    const year = new Date().getFullYear();
    if (!Number.isInteger(birthYear) || birthYear < year - 18 || birthYear > year) {
      return NextResponse.json({ error: "Anul nasterii nu pare corect." }, { status: 400 });
    }
  }
  if (pin && !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "PIN-ul trebuie sa aiba exact 4 cifre." }, { status: 400 });
  }

  const count = await prisma.childProfile.count({ where: { ownerId: session.user.id } });
  if (count >= MAX_CHILDREN) {
    return NextResponse.json(
      { error: `Poti avea maximum ${MAX_CHILDREN} profile pe un cont.` },
      { status: 400 }
    );
  }

  const child = await prisma.childProfile.create({
    data: {
      ownerId: session.user.id,
      name,
      avatar,
      birthYear,
      pinHash: pin ? await bcrypt.hash(pin, 10) : null,
    },
    select: { id: true, name: true, avatar: true, birthYear: true },
  });

  return NextResponse.json({ child });
}
