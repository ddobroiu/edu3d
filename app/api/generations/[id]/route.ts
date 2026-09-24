import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Publicarea in galerie sau retragerea din galerie. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.generation.updateMany({
    where: { id, userId: session.user.id, status: "COMPLETED" },
    data: {
      ...(body.isPublic !== undefined ? { isPublic: Boolean(body.isPublic) } : {}),
      ...(body.subject !== undefined ? { subject: String(body.subject) } : {}),
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Creatia nu a fost gasita." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await prisma.generation.deleteMany({ where: { id, userId: session.user.id } });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Creatia nu a fost gasita." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
