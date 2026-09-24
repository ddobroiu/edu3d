import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Coins, FileText, ShieldCheck, Users } from "lucide-react";
import { GENERATION_COST_TEXT, LIBRARY_OPEN_COST } from "@/lib/pricing";
import { CREDIT_PACKAGES, modelCount } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Modele 3D pentru școală",
  description:
    "Material didactic 3D și realitate augmentată pentru clasă: cod de acces pentru elevi, buget de credite controlat de profesor, factură pe unitatea de învățământ.",
  keywords: [
    "modele 3D pentru scoala",
    "material didactic 3D",
    "realitate augmentata scoala",
    "resurse educationale digitale",
    "tehnologie la clasa",
  ],
  alternates: { canonical: "/pentru-scoli" },
};

const BENEFITS = [
  {
    icon: Users,
    title: "O clasă, un cod",
    text: "Creezi clasa în două minute și dai elevilor un cod scurt, ușor de dictat cu voce tare. Elevii nu au nevoie de conturi proprii.",
  },
  {
    icon: Coins,
    title: "Buget controlat de tine",
    text: "Aloci credite clasei din contul tău. Elevii creează din acel buget și nu îl pot depăși.",
  },
  {
    icon: ShieldCheck,
    title: "Sigur pentru elevi",
    text: "Textele trec printr-un filtru automat. În galeria publică apar doar modelul și prenumele, nimic altceva.",
  },
  {
    icon: FileText,
    title: "Factură pe școală",
    text: "Emitem factură pe unitatea de învățământ, cu datele de facturare completate de tine.",
  },
];

export default function SchoolsPage() {
  const schoolPackage = CREDIT_PACKAGES.find((pkg) => pkg.audience === "school");

  return (
    <>
      <section className="chalkboard relative text-white">
        <div className="chalk-grid absolute inset-0" aria-hidden />
        <div className="animate-in relative mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Modele 3D pentru ora ta
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/65">
            Elevii creează modele pornind de la un text sau o fotografie, apoi le văd pe
            videoproiector, le așază pe bancă prin realitate augmentată sau intră lângă ele cu o
            cască VR.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/autentificare?mod=cont-nou"
              className="btn bg-white text-ink hover:bg-white/90"
            >
              Creează cont de profesor
              <ArrowRight size={17} aria-hidden />
            </Link>
            <Link href="/contact" className="btn border border-white/25 text-white hover:bg-white/10">
              Cere o ofertă
            </Link>
          </div>
        </div>
        <div className="h-2 bg-gradient-to-b from-amber-900/70 to-amber-950/80" aria-hidden />
      </section>

      <section className="paper-grid">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <ul className="stagger grid gap-8 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title}>
                <benefit.icon size={20} className="text-brand-600" aria-hidden />
                <h2 className="mt-4 font-medium">{benefit.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{benefit.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-rule bg-white">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Cum arată o oră</h2>
          <ol className="mt-6 space-y-4">
            {[
              "Arăți modelul pe videoproiector și pui o întrebare la care poza din manual nu răspunde.",
              "Elevii îl deschid pe telefon și îl așază pe bancă, în realitate augmentată.",
              "Fiecare descrie în scris obiectul pe care vrea să îl vadă și îl creează.",
              "Comparați rezultatele și discutați de ce unele descrieri au ieșit mai bine.",
            ].map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {index + 1}
                </span>
                <span className="leading-relaxed text-ink-soft">{step}</span>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-sm text-ink-soft">
            Mai multe în ghidul{" "}
            <Link href="/ghiduri/realitate-augmentata-la-clasa" className="text-brand-700 underline">
              Realitate augmentată la clasă, fără echipamente scumpe
            </Link>
            .
          </p>
        </div>
      </section>

      {schoolPackage && (
        <section className="paper-grid border-t border-rule">
          <div className="mx-auto max-w-2xl px-5 py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Pachetul {schoolPackage.name}</h2>
            <p className="mt-4">
              <span className="text-5xl font-semibold tracking-tight text-brand-700">
                {schoolPackage.price}
              </span>
              <span className="ml-2 text-ink-soft">lei</span>
            </p>
            <p className="mt-2 text-ink-soft">
              {schoolPackage.credits + schoolPackage.bonus} credite &middot; aproximativ{" "}
              {modelCount(schoolPackage)} lucrări
            </p>
            <p className="mt-4 text-sm text-ink-soft">
              O lucrare din text costă {GENERATION_COST_TEXT} credite, iar deschiderea unui model
              din bibliotecă {LIBRARY_OPEN_COST} credite. Creditele nu expiră.
            </p>
            <Link href="/tarife" className="btn-primary mt-8">
              Vezi toate pachetele
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
