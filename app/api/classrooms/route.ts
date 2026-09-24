import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateJoinCode } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const classrooms = await prisma.classroom.findMany({
    where: { teacherId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        include: { child: { select: { id: true, name: true, avatar: true } } },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { generations: true } },
    },
  });

  return NextResponse.json({ classrooms });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Doar conturile de profesor pot crea clase." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const name = String(body.name || "").trim();
  const grade = body.grade ? String(body.grade).trim() : null;

  if (name.length < 2 || name.length > 60) {
    return NextResponse.json({ error: "Numele clasei trebuie sa aiba intre 2 si 60 de caractere." }, { status: 400 });
  }

  // joinCode este unic; in practica prima incercare reuseste aproape mereu.
  for (let attempt = 0; attempt < 5; attempt++) {
    const joinCode = generateJoinCode();
    const taken = await prisma.classroom.findUnique({ where: { joinCode }, select: { id: true } });
    if (taken) continue;

    const classroom = await prisma.classroom.create({
      data: { teacherId: session.user.id, name, grade, joinCode },
    });
    return NextResponse.json({ classroom });
  }

  return NextResponse.json({ error: "Nu am putut genera un cod de clasa. Incearca din nou." }, { status: 500 });
}
