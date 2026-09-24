import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Box, Coins, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import ChildrenManager from "@/components/ChildrenManager";
import JoinClassroom from "@/components/JoinClassroom";
import BillingForm from "@/components/BillingForm";
import Avatar from "@/components/Avatar";
import { formatDate } from "@/lib/utils";
import { words } from "@/lib/wording";

export const metadata: Metadata = { title: "Contul meu" };
export const dynamic = "force-dynamic";

export default async function ParentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/autentificare");

  const [user, children, generations, transactions, billing] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, credits: true, totalCreditsUsed: true },
    }),
    prisma.childProfile.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: { select: { generations: true } },
      },
    }),
    prisma.generation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        prompt: true,
        status: true,
        thumbnailUrl: true,
        createdAt: true,
        child: { select: { name: true, avatar: true } },
      },
    }),
    prisma.creditTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.billingDetails.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!user) redirect("/autentificare");

  const w = words(session.user.role);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {user.name ?? "Contul meu"}
        </h1>
        <p className="mt-2 text-lg text-ink-soft">
          {w.dashboardIntro}
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Coins size={22} aria-hidden />}
          value={user.credits}
          label="credite disponibile"
          accent="bg-brand-100 text-brand-700"
        />
        <StatCard
          icon={<Box size={22} aria-hidden />}
          value={generations.length}
          label={`${w.creations} recente`}
          accent="bg-brand-100 text-brand-700"
        />
        <StatCard
          icon={<Users size={22} aria-hidden />}
          value={children.length}
          label={`profiluri de ${w.child}`}
          accent="bg-brand-100 text-brand-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">{w.creationsTitle}</h2>
              <Link href="/creeaza" className="btn-primary px-4 py-2">
                Atelier
              </Link>
            </div>

            {generations.length === 0 ? (
              <p className="py-8 text-center text-ink-soft">
                Nu ai nimic creat inca. Un model e gata in doua minute.
              </p>
            ) : (
              <ul className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {generations.map((generation) => (
                  <li key={generation.id}>
                    <Link
                      href={
                        generation.status === "COMPLETED" ? `/model/${generation.id}` : "/creeaza"
                      }
                      className="group block h-full overflow-hidden rounded-sm border border-rule transition-colors hover:border-brand-400"
                    >
                      <div className="relative aspect-square border-b border-rule bg-brand-50">
                        {generation.thumbnailUrl ? (
                          <Image
                            src={generation.thumbnailUrl}
                            alt={generation.prompt || "Model 3D"}
                            fill
                            className="object-cover"
                            sizes="200px"
                            unoptimized
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-sm font-semibold text-brand-700">
                            {generation.status === "PROCESSING" ? "In procesare" : "Fara previzualizare"}
                          </div>
                        )}
                        {generation.status !== "COMPLETED" && (
                          <span className="absolute left-0 top-2 rounded-r-sm bg-brand-700 px-2 py-0.5 text-xs font-medium text-white">
                            {generation.status === "FAILED" ? "Esuat" : "In procesare"}
                          </span>
                        )}
                      </div>
                      <div className="bg-white p-3">
                        <p className="line-clamp-1 text-sm font-semibold group-hover:text-brand-700">
                          {generation.prompt || "Lucrare din fotografie"}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                          {generation.child ? (
                            <>
                              <Avatar
                                name={generation.child.name}
                                color={generation.child.avatar}
                                size="sm"
                                className="h-5 w-5 text-[0.55rem]"
                              />
                              {generation.child.name.split(" ")[0]}
                            </>
                          ) : (
                            formatDate(generation.createdAt)
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Istoricul creditelor</h2>
            {transactions.length === 0 ? (
              <p className="text-ink-soft">Nu exista inregistrari.</p>
            ) : (
              <ul className="divide-y divide-rule">
                {transactions.map((transaction) => (
                  <li key={transaction.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-ink-soft">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <span
                      className={`font-display font-bold ${
                        transaction.amount > 0 ? "text-emerald-600" : "text-ink-soft"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <ChildrenManager initialChildren={children} role={session.user.role} />

          <BillingForm initial={billing} />

          <JoinClassroom kids={children.map((child) => ({ id: child.id, name: child.name }))} />

          <div className="card border-l-4 border-l-brand-600 p-6">
            <p className="font-display text-lg font-bold">{user.credits} credite</p>
            <p className="mt-1 text-sm text-ink-soft">
              Utilizate pana acum: {user.totalCreditsUsed}
            </p>
            <Link href="/tarife" className="btn-sun mt-4 w-full">
              Achizitie credite
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  accent: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${accent}`}>{icon}</span>
      <div>
        <p className="font-display text-2xl font-extrabold">{value}</p>
        <p className="text-sm text-ink-soft">{label}</p>
      </div>
    </div>
  );
}
