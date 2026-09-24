import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold">Nu am gasit pagina</h1>
      <p className="mt-3 text-lg text-ink-soft">
        Poate modelul a fost sters sau nu este public. Incearca din galerie.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          Mergi la pagina principala
        </Link>
        <Link href="/modele" className="btn-ghost">
          Vezi modelele
        </Link>
      </div>
    </div>
  );
}
