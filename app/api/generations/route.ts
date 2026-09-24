import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Creatiile contului curent, optional filtrate pe un copil sau o clasa. */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const url = new URL(req.url);
  const childId = url.searchParams.get("childId");
  const classroomId = url.searchParams.get("classroomId");
  const take = Math.min(Number(url.searchParams.get("take") || 40), 100);

  const generations = await prisma.generation.findMany({
    where: {
      ...(classroomId
        ? { classroom: { OR: [{ teacherId: session.user.id }] }, classroomId }
        : { userId: session.user.id }),
      ...(childId ? { childId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      prompt: true,
      mode: true,
      status: true,
      modelUrl: true,
      thumbnailUrl: true,
      subject: true,
      isPublic: true,
      createdAt: true,
      child: { select: { id: true, name: true, avatar: true } },
    },
  });

  return NextResponse.json({ generations });
}
