import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Workshop from "@/components/Workshop";

export const metadata: Metadata = {
  title: "Atelierul 3D",
  description: "Scrie ce vrei sa vezi sau incarca o poza, iar edu3d construieste modelul 3D.",
};

export const dynamic = "force-dynamic";

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ materie?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/autentificare?mod=cont-nou");
  }

  const { materie } = await searchParams;

  // Soldul se citeste din baza, nu din sesiune: JWT-ul poate fi in urma daca
  // s-au consumat credite intre timp (de exemplu deschizand un model).
  const [user, children, classrooms] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    }),
    prisma.childProfile.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, avatar: true },
    }),
    prisma.classroom.findMany({
      where: { teacherId: session.user.id, active: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        creditPool: true,
        members: { select: { child: { select: { id: true, name: true, avatar: true } } } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Atelierul 3D</h1>
        <p className="mt-2 text-lg text-ink-soft">
          Spune-ne ce vrei sa vezi. In cateva minute il ai in 3D, gata de rotit si de explorat in VR.
        </p>
      </header>

      {children.length === 0 && classrooms.length === 0 ? (
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Mai intai, cine creeaza?</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            Adauga un profil pentru copilul tau, ca fiecare creatie sa ajunga in galeria lui. Dureaza
            zece secunde.
          </p>
          <Link href="/parinte" className="btn-primary mt-6">
            Adauga primul profil
          </Link>
        </div>
      ) : (
        <Workshop
          kids={children}
          role={session.user.role}
          classrooms={classrooms}
          initialSubject={materie ?? null}
          credits={user?.credits ?? 0}
        />
      )}
    </div>
  );
}
