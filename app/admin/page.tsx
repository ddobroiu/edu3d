import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Coins, FileText, Package, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Administrare", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  // Pagina nu exista pentru cine nu are dreptul: 404, nu 403, ca sa nu
  // confirmam ca panoul se afla la aceasta adresa.
  if (session?.user?.role !== "ADMIN") notFound();

  const [users, purchases, paid, generationCount, libraryCount, creditsSold] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
        totalCreditsUsed: true,
        createdAt: true,
        _count: { select: { generations: true, children: true, purchases: true } },
      },
    }),
    prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.purchase.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.generation.count(),
    prisma.libraryModel.count({ where: { status: "READY" } }),
    prisma.purchase.aggregate({ where: { status: "COMPLETED" }, _sum: { credits: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Administrare</h1>
        <p className="mt-2 text-ink-soft">Clienti, achizitii si stare generala.</p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Coins size={20} aria-hidden />}
          value={formatPrice(paid._sum.amount ?? 0)}
          label={`incasari din ${paid._count} plati`}
        />
        <Stat
          icon={<Users size={20} aria-hidden />}
          value={String(users.length)}
          label="conturi (ultimele 100)"
        />
        <Stat
          icon={<Package size={20} aria-hidden />}
          value={String(generationCount)}
          label="creatii generate"
        />
        <Stat
          icon={<FileText size={20} aria-hidden />}
          value={String(creditsSold._sum.credits ?? 0)}
          label="credite vandute"
        />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Achizitii</h2>

        {purchases.length === 0 ? (
          <p className="rounded-xl border border-dashed border-rule py-12 text-center text-ink-soft">
            Nicio achizitie inregistrata.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-rule">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="bg-surface text-left">
                <tr className="border-b border-rule">
                  <Th>Client</Th>
                  <Th>Pachet</Th>
                  <Th>Suma</Th>
                  <Th>Credite</Th>
                  <Th>Stare</Th>
                  <Th>Factura</Th>
                  <Th>Data</Th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-rule last:border-b-0">
                    <Td>
                      <span className="block font-medium">{purchase.user.name ?? "—"}</span>
                      <span className="text-xs text-ink-soft">{purchase.user.email}</span>
                    </Td>
                    <Td>{purchase.packageId ?? "—"}</Td>
                    <Td>{formatPrice(purchase.amount, purchase.currency)}</Td>
                    <Td>{purchase.credits}</Td>
                    <Td>
                      <StatusBadge status={purchase.status} />
                    </Td>
                    <Td>
                      {purchase.invoiceUrl ? (
                        <a
                          href={purchase.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-700 underline"
                        >
                          Descarca
                        </a>
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-ink-soft">
                      {formatDate(purchase.createdAt)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Conturi</h2>
        <div className="overflow-x-auto rounded-xl border border-rule">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="bg-surface text-left">
              <tr className="border-b border-rule">
                <Th>Cont</Th>
                <Th>Rol</Th>
                <Th>Credite</Th>
                <Th>Folosite</Th>
                <Th>Creatii</Th>
                <Th>Profiluri</Th>
                <Th>Plati</Th>
                <Th>Inregistrat</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-rule last:border-b-0">
                  <Td>
                    <span className="block font-medium">{user.name ?? "—"}</span>
                    <span className="text-xs text-ink-soft">{user.email}</span>
                  </Td>
                  <Td>{user.role}</Td>
                  <Td>{user.credits}</Td>
                  <Td>{user.totalCreditsUsed}</Td>
                  <Td>{user._count.generations}</Td>
                  <Td>{user._count.children}</Td>
                  <Td>{user._count.purchases}</Td>
                  <Td className="whitespace-nowrap text-ink-soft">{formatDate(user.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-8 text-sm text-ink-soft">
        {libraryCount} modele din biblioteca sunt in acest moment in stocare.{" "}
        <Link href="/modele" className="text-brand-700 underline">
          Vezi biblioteca
        </Link>
      </p>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-rule p-5">
      <span className="text-brand-600">{icon}</span>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className ?? ""}`}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-800",
    FAILED: "bg-red-50 text-red-700",
    REFUNDED: "bg-surface text-ink-soft",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-surface text-ink-soft"
      }`}
    >
      {status}
    </span>
  );
}
