import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Politica de cookieuri",
  description: "Ce cookieuri folosește EDU3D, la ce servesc și cum îți schimbi alegerea.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Politica de cookieuri</h1>
      <p className="mt-2 text-sm text-ink-soft">Ultima actualizare: septembrie 2026</p>

      <div className="mt-10 space-y-8 leading-relaxed text-ink-soft">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-ink">Ce sunt cookieurile</h2>
          <p>
            Fișiere mici pe care site-ul le păstrează în browserul tău. Unele sunt necesare ca
            platforma să funcționeze, altele ne-ar ajuta să înțelegem cum este folosită.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-ink">Ce folosim acum</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-rule text-left text-ink">
                  <th className="py-2 pr-4 font-medium">Cookie</th>
                  <th className="py-2 pr-4 font-medium">Scop</th>
                  <th className="py-2 font-medium">Durată</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-rule">
                  <td className="py-2.5 pr-4">Sesiune de autentificare</td>
                  <td className="py-2.5 pr-4">
                    Te ține conectat între pagini. Fără el nu poți avea cont.
                  </td>
                  <td className="py-2.5">30 de zile</td>
                </tr>
                <tr className="border-b border-rule">
                  <td className="py-2.5 pr-4">Protecție CSRF</td>
                  <td className="py-2.5 pr-4">
                    Împiedică trimiterea de formulare în numele tău de pe alt site.
                  </td>
                  <td className="py-2.5">Sesiune</td>
                </tr>
                <tr className="border-b border-rule">
                  <td className="py-2.5 pr-4">Preferința de cookieuri</td>
                  <td className="py-2.5 pr-4">Reține răspunsul tău, ca să nu te mai întrebăm.</td>
                  <td className="py-2.5">Permanent</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4">
            Toate sunt <strong className="text-ink">strict necesare</strong>. Conform legislației,
            pentru ele nu este nevoie de consimțământ. În acest moment nu folosim cookieuri de
            analiză, de publicitate sau de urmărire între site-uri.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-ink">De ce apare totuși bannerul</h2>
          <p>
            Ca alegerea ta să fie înregistrată din start. Dacă vom adăuga un instrument de analiză,
            acesta va porni doar pentru cei care au apăsat „Accept toate”. Implicit, nu pornește
            nimic.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-ink">Cum îți schimbi alegerea</h2>
          <p>
            Șterge datele site-ului din setările browserului, iar bannerul va reapărea la
            următoarea vizită. Blocarea cookieurilor strict necesare face imposibilă
            autentificarea.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-ink">Servicii externe</h2>
          <p>
            Plățile sunt procesate de Stripe, care poate seta propriile cookieuri pe pagina lor de
            plată. Fonturile sunt încărcate de la Google Fonts. Modelele 3D sunt generate prin
            Replicate și stocate la Cloudflare. Niciunul dintre aceste servicii nu primește date
            despre navigarea ta pe site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-ink">Contact</h2>
          <p>
            Întrebări despre cookieuri sau despre datele tale:{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-brand-700 underline">
              {COMPANY.email}
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-rule pt-6">
        <Link href="/confidentialitate" className="btn-ghost">
          Politica de confidențialitate
        </Link>
      </div>
    </div>
  );
}
