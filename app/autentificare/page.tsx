import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Intra in cont",
  description: "Autentifica-te sau creeaza un cont de parinte ori de profesor pe edu3d.",
};

export default function AuthPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center">
      <div className="hidden lg:block">
        <h1 className="font-display text-4xl font-extrabold leading-tight">
          Acces in platforma
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Un singur cont pentru intreaga familie sau pentru o clasa. Titularul administreaza creditele si profilurile de elev.
        </p>
        <ul className="mt-8 space-y-3 text-ink-soft">
          <li className="flex gap-3">
            <span className="font-display font-bold text-brand-600">10</span>
            credite incluse la inregistrare, cat pentru prima ta creatie
          </li>
          <li className="flex gap-3">
            <span className="font-display font-bold text-brand-600">12</span>
            profiluri de elev pe un singur cont
          </li>
          <li className="flex gap-3">
            <span className="font-display font-bold text-brand-600">0</span>
            lei si nicio informatie de plata solicitata la inregistrare
          </li>
        </ul>
      </div>

      <Suspense fallback={<div className="card h-96 animate-pulse" />}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
