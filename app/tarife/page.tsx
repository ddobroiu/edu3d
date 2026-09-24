import type { Metadata } from "next";
import { Check, Coins } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CREDIT_PACKAGES, modelCount } from "@/lib/packages";
import {
  GENERATION_COST_IMAGE,
  GENERATION_COST_TEXT,
  LIBRARY_OPEN_COST,
} from "@/lib/pricing";
import BuyButton from "@/components/BuyButton";

export const metadata: Metadata = {
  title: "Tarife",
  description:
    "Pachete de credite pentru familii si pentru unitati de invatamant. Fara abonament, creditele nu expira.",
};

export const dynamic = "force-dynamic";

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ anulat?: string }>;
}) {
  const session = await auth();
  const { anulat } = await searchParams;

  // Soldul real, nu cel din JWT, care poate fi in urma.
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold">Tarife</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-soft">
          Platforma nu functioneaza pe baza de abonament. Creditele se achizitioneaza o singura
          data si nu expira.
        </p>

        <dl className="mx-auto mt-8 grid max-w-2xl gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-3">
          <div className="bg-white px-5 py-4">
            <dt className="text-sm text-ink-soft">Model din text</dt>
            <dd className="mt-1 text-xl font-semibold">{GENERATION_COST_TEXT} credite</dd>
          </div>
          <div className="bg-white px-5 py-4">
            <dt className="text-sm text-ink-soft">Model din fotografie</dt>
            <dd className="mt-1 text-xl font-semibold">{GENERATION_COST_IMAGE} credite</dd>
          </div>
          <div className="bg-white px-5 py-4">
            <dt className="text-sm text-ink-soft">Model din biblioteca</dt>
            <dd className="mt-1 text-xl font-semibold">{LIBRARY_OPEN_COST} credite</dd>
          </div>
        </dl>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-ink-soft">
          Un model din biblioteca se plateste o singura data: dupa prima deschidere il poti revedea
          oricand, gratuit.
        </p>

        {session?.user && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-sm border border-rule px-5 py-3 font-semibold text-brand-700">
            <Coins size={20} aria-hidden />
            Credite disponibile: {user?.credits ?? 0}
          </p>
        )}
      </header>

      {anulat && (
        <p
          role="status"
          className="mx-auto mt-8 max-w-xl border-l-4 border-amber-600 bg-amber-50 px-5 py-4 text-center font-medium text-amber-900"
        >
          Plata a fost anulata. Nu a fost efectuata nicio tranzactie.
        </p>
      )}

      {/* Toate cele trei pachete pe acelasi rand, ca sa se compare dintr-o privire. */}
      <section className="stagger mt-12 grid gap-6 lg:grid-cols-3">
        {CREDIT_PACKAGES.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} loggedIn={Boolean(session?.user)} />
        ))}
      </section>

      <section className="card mt-14 p-8">
        <h2 className="font-display text-2xl font-bold">Intrebari frecvente</h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="font-display font-bold">Creditele expira?</dt>
            <dd className="mt-1 text-ink-soft">
              Nu. Raman in cont pana la utilizare.
            </dd>
          </div>
          <div>
            <dt className="font-display font-bold">Ce se intampla daca o lucrare esueaza?</dt>
            <dd className="mt-1 text-ink-soft">
              Creditele sunt returnate automat in cont, fara solicitare.
            </dd>
          </div>
          <div>
            <dt className="font-display font-bold">Se emite factura?</dt>
            <dd className="mt-1 text-ink-soft">
              Da, prin email dupa fiecare plata. Pentru unitatile de invatamant, factura se emite pe institutie.
            </dd>
          </div>
          <div>
            <dt className="font-display font-bold">Modelele pot fi descarcate?</dt>
            <dd className="mt-1 text-ink-soft">
              Da, in format GLB, compatibil cu programele de modelare si cu imprimantele 3D.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function PackageCard({
  pkg,
  loggedIn,
}: {
  pkg: (typeof CREDIT_PACKAGES)[number];
  loggedIn: boolean;
}) {
  return (
    <div className={`card relative flex flex-col p-8 ${pkg.popular ? "border-brand-600 ring-1 ring-brand-600" : ""}`}>
      {pkg.popular && (
        <span className="absolute -top-0.5 right-0 bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
          Recomandat
        </span>
      )}

      <h3 className="text-xl font-semibold tracking-tight">{pkg.name}</h3>
      <p className="mt-1 text-sm text-ink-soft">
        {pkg.audience === "school" ? "Pentru scoli" : "Pentru familii"}
      </p>

      <p className="mt-4">
        <span className="font-display text-5xl font-bold text-brand-700">{pkg.price}</span>
        <span className="ml-2 text-ink-soft">lei</span>
      </p>

      <p className="mt-2 font-semibold text-ink-soft">
        {pkg.credits} credite
        {pkg.bonus > 0 && <span className="text-brand-600"> + {pkg.bonus} bonus</span>}
        {" · "}aproximativ {modelCount(pkg)} lucrari
      </p>

      {/* flex-1 aliniaza butoanele la baza, indiferent cate avantaje are pachetul. */}
      <ul className="mt-6 flex-1 space-y-2.5">
        {pkg.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm text-ink-soft">
            <Check size={17} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
            {perk}
          </li>
        ))}
      </ul>

      <BuyButton packageId={pkg.id} loggedIn={loggedIn} popular={pkg.popular} />
    </div>
  );
}
