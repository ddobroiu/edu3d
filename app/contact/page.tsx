import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Scrie-ne pentru intrebari, oferte pentru scoli sau suport tehnic.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Contact</h1>
      <p className="mt-3 text-ink-soft">
        Intrebari, oferte pentru scoli sau suport tehnic. Raspundem in maximum o zi lucratoare.
      </p>

      <a
        href="mailto:contact@edu3d.ro"
        className="tile mt-10 flex items-center gap-4 p-6"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Mail size={20} aria-hidden />
        </span>
        <span>
          <span className="block font-medium">contact@edu3d.ro</span>
          <span className="block text-sm text-ink-soft">Scrie-ne oricand</span>
        </span>
      </a>
    </div>
  );
}
