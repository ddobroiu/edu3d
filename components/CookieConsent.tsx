"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "edu3d-cookie-consent";

export type ConsentValue = "accepted" | "rejected";

/** Ce a ales utilizatorul; `null` daca nu a ales inca. */
export function readConsent(): ConsentValue | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Bannerul de cookieuri.
 *
 * Platforma foloseste in acest moment doar cookieuri strict necesare (sesiunea
 * de autentificare), care nu cer consimtamant. Bannerul exista pentru ca orice
 * instrument de analiza adaugat ulterior sa fie pornit doar dupa acceptare:
 * implicit, alegerea este "respins".
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Nu il aratam daca utilizatorul a raspuns deja.
    if (readConsent() === null) setVisible(true);
  }, []);

  function choose(value: ConsentValue) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* daca stocarea e blocata, bannerul reapare la urmatoarea vizita */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferinte cookieuri"
      className="animate-in fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-relaxed text-ink-soft">
          Folosim cookieuri strict necesare pentru autentificare. Cu acordul tau am folosi si
          cookieuri de analiza, ca sa vedem ce pagini sunt utile.{" "}
          <Link href="/cookies" className="font-medium text-brand-700 underline">
            Detalii
          </Link>
        </p>

        <div className="flex shrink-0 gap-2">
          <button onClick={() => choose("rejected")} className="btn-ghost py-2">
            Doar necesare
          </button>
          <button onClick={() => choose("accepted")} className="btn-primary py-2">
            Accept toate
          </button>
        </div>
      </div>
    </div>
  );
}
