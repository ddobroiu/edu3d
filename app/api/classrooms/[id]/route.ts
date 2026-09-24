import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { InsufficientCreditsError, allocateToClassroom } from "@/lib/credits";

export const dynamic = "force-dynamic";

/** Profesorul aloca credite din contul lui in bugetul clasei, sau inchide clasa. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const classroom = await prisma.classroom.findFirst({
    where: { id, teacherId: session.user.id },
    select: { id: true },
  });
  if (!classroom) return NextResponse.json({ error: "Clasa nu a fost gasita." }, { status: 404 });

  if (body.allocate !== undefined) {
    const amount = Number(body.allocate);
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "Numarul de credite nu este valid." }, { status: 400 });
    }

    try {
      await allocateToClassroom(session.user.id, id, amount);
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return NextResponse.json({ error: error.message, needsCredits: true }, { status: 402 });
      }
      throw error;
    }
  }

  if (body.active !== undefined) {
    await prisma.classroom.update({ where: { id }, data: { active: Boolean(body.active) } });
  }

  const updated = await prisma.classroom.findUnique({ where: { id } });
  return NextResponse.json({ classroom: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await prisma.classroom.deleteMany({ where: { id, teacherId: session.user.id } });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Clasa nu a fost gasita." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
