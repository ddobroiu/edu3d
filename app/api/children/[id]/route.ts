import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const owned = await prisma.childProfile.findFirst({
    where: { id, ownerId: session.user.id },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Profil negasit." }, { status: 404 });

  const data: { name?: string; avatar?: string } = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 40) {
      return NextResponse.json({ error: "Nume invalid." }, { status: 400 });
    }
    data.name = name;
  }
  if (body.avatar !== undefined) data.avatar = String(body.avatar);

  const child = await prisma.childProfile.update({
    where: { id },
    data,
    select: { id: true, name: true, avatar: true },
  });

  return NextResponse.json({ child });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const { id } = await params;
  // Creatiile raman in cont (childId devine null), ca stergerea unui profil
  // sa nu duca la pierderea modelelor deja platite.
  const deleted = await prisma.childProfile.deleteMany({
    where: { id, ownerId: session.user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Profil negasit." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
