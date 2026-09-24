import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Un parinte inscrie copilul intr-o clasa folosind codul primit de la profesor. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const body = await req.json();
  const code = String(body.code || "").trim().toUpperCase();
  const childId = String(body.childId || "").trim();

  if (!code || !childId) {
    return NextResponse.json({ error: "Completeaza codul clasei si alege copilul." }, { status: 400 });
  }

  const child = await prisma.childProfile.findFirst({
    where: { id: childId, ownerId: session.user.id },
    select: { id: true, name: true },
  });
  if (!child) return NextResponse.json({ error: "Profil negasit." }, { status: 404 });

  const classroom = await prisma.classroom.findFirst({
    where: { joinCode: code, active: true },
    select: { id: true, name: true, teacher: { select: { name: true, schoolName: true } } },
  });
  if (!classroom) {
    return NextResponse.json({ error: "Codul nu corespunde niciunei clase active." }, { status: 404 });
  }

  await prisma.classroomMember.upsert({
    where: { classroomId_childId: { classroomId: classroom.id, childId: child.id } },
    create: { classroomId: classroom.id, childId: child.id },
    update: {},
  });

  return NextResponse.json({ classroom });
}
