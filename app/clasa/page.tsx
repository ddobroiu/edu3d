import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import ClassroomManager from "@/components/ClassroomManager";

export const metadata: Metadata = { title: "Clasele mele" };
export const dynamic = "force-dynamic";

export default async function ClassroomPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/autentificare");

  const isTeacher = session.user.role === "TEACHER" || session.user.role === "ADMIN";

  if (!isTeacher) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <GraduationCap size={32} aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold">Zona profesorilor</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Contul tau este de parinte. Clasele se creeaza dintr-un cont de profesor. Scrie-ne si iti
          schimbam tipul contului.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/parinte" className="btn-primary">
            Mergi la contul meu
          </Link>
          <Link href="/contact" className="btn-ghost">
            Contacteaza-ne
          </Link>
        </div>
      </div>
    );
  }

  const [classrooms, user] = await Promise.all([
    prisma.classroom.findMany({
      where: { teacherId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          orderBy: { joinedAt: "asc" },
          include: { child: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { generations: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, schoolName: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Clasele mele</h1>
        <p className="mt-2 text-lg text-ink-soft">
          {user?.schoolName ? `${user.schoolName} · ` : ""}
          Ai {user?.credits ?? 0} credite in cont, pe care le poti imparti intre clase.
        </p>
      </header>

      <ClassroomManager
        initialClassrooms={classrooms.map((classroom) => ({
          id: classroom.id,
          name: classroom.name,
          grade: classroom.grade,
          joinCode: classroom.joinCode,
          creditPool: classroom.creditPool,
          active: classroom.active,
          generationCount: classroom._count.generations,
          members: classroom.members.map((member) => member.child),
        }))}
        teacherCredits={user?.credits ?? 0}
      />
    </div>
  );
}
