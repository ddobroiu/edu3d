import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Library, Type } from "lucide-react";
import SpinModel from "@/components/SpinModel";

const FEATURES = [
  { icon: Type, title: "Din text", text: "Scrii ce vrei sa vezi. Atat." },
  { icon: ImageIcon, title: "Din imagine", text: "Incarci o poza si o transformi in model." },
  {
    icon: Library,
    title: "Peste 1.000.000 de modele",
    text: "Biblioteca gata de explorat, fara sa creezi nimic.",
  },
];

// Modele usoare, incarcate abia cand ajung in dreptul ecranului.
const SHOWCASE = [
  { label: "Animale", src: "https://ar.3dview.ai/examples/elephant-idle.glb", alt: "Elefant 3D" },
  { label: "Plante", src: "https://ar.3dview.ai/examples/banana.glb", alt: "Banana 3D" },
  { label: "Cladiri", src: "https://ar.3dview.ai/examples/wooden-cabin.glb", alt: "Cabana 3D" },
];

export default function HomePage() {
  return (
    <>
      {/* Antetul este tabla din clasa. */}
      <section className="chalkboard relative text-white">
        <div className="chalk-grid absolute inset-0" aria-hidden />

        <div className="animate-in relative mx-auto max-w-3xl px-5 py-28 text-center sm:py-36">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Orice iti imaginezi,
            <br />
            <span className="text-emerald-200">in 3D</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg text-white/65">
            Un text sau o poza. In doua minute ai modelul, gata de rotit, de vazut in camera ta si
            in VR.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/creeaza" className="btn bg-white text-ink hover:bg-white/90">
              Creeaza un model
              <ArrowRight size={17} aria-hidden />
            </Link>
            <Link
              href="/modele"
              className="btn border border-white/25 text-white hover:bg-white/10"
            >
              Vezi modele
            </Link>
          </div>
        </div>

        {/* Rama de lemn a tablei. */}
        <div className="h-2 bg-gradient-to-b from-amber-900/70 to-amber-950/80" aria-hidden />
      </section>

      {/* De aici incolo, foaia de caiet. */}
      <section className="paper-grid">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <ul className="stagger grid gap-6 sm:grid-cols-3">
            {SHOWCASE.map((item) => (
              <li key={item.label}>
                <div className="rounded-xl border border-rule bg-white p-2">
                  <SpinModel src={item.src} alt={item.alt} />
                </div>
                <p className="mt-3 text-sm text-ink-soft">{item.label}</p>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-center text-lg">
            Si orice altceva. <span className="text-ink-soft">Nu exista o lista.</span>
          </p>
        </div>
      </section>

      <section className="border-t border-rule bg-white">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <ul className="stagger grid gap-10 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <feature.icon size={20} className="text-brand-600" aria-hidden />
                <h2 className="mt-4 font-medium">{feature.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{feature.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="paper-grid border-t border-rule">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-5 px-5 py-16 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg">
            10 credite la inregistrare.{" "}
            <span className="text-ink-soft">Fara card, fara abonament.</span>
          </p>
          <div className="flex gap-3">
            <Link href="/tarife" className="btn-ghost">
              Tarife
            </Link>
            <Link href="/autentificare?mod=cont-nou" className="btn-primary">
              Incepe
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
