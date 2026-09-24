import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Soldul si datele contului, pentru bara de sus si dashboard. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      credits: true,
      totalCreditsUsed: true,
      schoolName: true,
      _count: { select: { children: true, generations: true } },
    },
  });

  return NextResponse.json({ user });
}
