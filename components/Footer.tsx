import Link from "next/link";
import Logo from "@/components/Logo";
import { COMPANY } from "@/lib/company";

const LINKS = [
  { href: "/creeaza", label: "Creeaza" },
  { href: "/modele", label: "Modele" },
  { href: "/tarife", label: "Tarife" },
  { href: "/ghiduri", label: "Ghiduri" },
  { href: "/pentru-scoli", label: "Pentru scoli" },
];

const LEGAL = [
  { href: "/termeni", label: "Termeni si conditii" },
  { href: "/confidentialitate", label: "Confidentialitate" },
  { href: "/cookies", label: "Cookieuri" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo size={26} />

          {/* Clauza completa despre continutul generat sta in Termeni, art. 7. */}
          <p className="mt-5 max-w-xs text-lg font-medium leading-snug">
            Scrii un rand.
            <br />
            Iti iese un obiect.
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            Din text sau dintr-o poza, in doua minute. Il rotesti, il asezi in camera ta si intri
            langa el.
          </p>
        </div>

        <nav aria-label="Platforma">
          <h2 className="text-sm font-semibold">Platforma</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informatii legale">
          <h2 className="text-sm font-semibold">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {LEGAL.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={COMPANY.anpcUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                ANPC
              </a>
            </li>
            <li>
              <a
                href={COMPANY.odrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                Solutionarea online a litigiilor
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Datele operatorului, obligatorii pentru un magazin online din Romania. */}
      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            {COMPANY.name} &middot; CUI {COMPANY.cui} &middot; {COMPANY.regCom}
            {COMPANY.address && <> &middot; {COMPANY.address}</>}
            {COMPANY.phone && <> &middot; {COMPANY.phone}</>}
            {" · "}
            <a href={`mailto:${COMPANY.email}`} className="hover:text-ink">
              {COMPANY.email}
            </a>
          </p>
          <p>&copy; {new Date().getFullYear()} {COMPANY.brand}</p>
        </div>
      </div>
    </footer>
  );
}
