"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "/creeaza", label: "Creeaza" },
  { href: "/modele", label: "Modele" },
  { href: "/ghiduri", label: "Ghiduri" },
  { href: "/pentru-scoli", label: "Pentru scoli" },
  { href: "/tarife", label: "Tarife" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  // Soldul din sesiune poate ramane in urma dupa o generare sau o deschidere
  // platita, asa ca il recitim de la server la fiecare schimbare de pagina.
  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && typeof data?.user?.credits === "number") setCredits(data.user.credits);
      })
      .catch(() => {
        /* pastram valoarea din sesiune */
      });
    return () => {
      active = false;
    };
  }, [status, pathname]);

  const isTeacher = session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN";
  const accountHref = isTeacher ? "/clasa" : "/parinte";

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
        <Link href="/" aria-label="edu3d, pagina principala">
          <Logo size={26} />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith(link.href)
                    ? "text-ink"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {status === "authenticated" ? (
            <>
              <Link
                href="/tarife"
                className="rounded-full border border-rule px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
              >
                {credits ?? session.user.credits} credite
              </Link>
              <Link href={accountHref} className="text-sm text-ink-soft transition-colors hover:text-ink">
                Cont
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-ink-soft transition-colors hover:text-ink"
              >
                Iesire
              </button>
            </>
          ) : status === "loading" ? (
            <div className="h-8 w-32 animate-pulse rounded-lg bg-surface" />
          ) : (
            <>
              <Link href="/autentificare" className="text-sm text-ink-soft transition-colors hover:text-ink">
                Autentificare
              </Link>
              <Link href="/autentificare?mod=cont-nou" className="btn-primary py-2">
                Incepe
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          className="ml-auto rounded-md p-2 md:hidden"
          aria-label={open ? "Inchide meniul" : "Deschide meniul"}
          aria-expanded={open}
        >
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-rule bg-white px-5 py-3 md:hidden">
          <ul className="space-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md py-2 text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-col gap-2 border-t border-rule pt-3">
            {status === "authenticated" ? (
              <>
                <Link href={accountHref} onClick={() => setOpen(false)} className="btn-ghost">
                  Cont &middot; {credits ?? session.user.credits} credite
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost">
                  Iesire
                </button>
              </>
            ) : (
              <>
                <Link href="/autentificare" onClick={() => setOpen(false)} className="btn-ghost">
                  Autentificare
                </Link>
                <Link
                  href="/autentificare?mod=cont-nou"
                  onClick={() => setOpen(false)}
                  className="btn-primary"
                >
                  Incepe
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
