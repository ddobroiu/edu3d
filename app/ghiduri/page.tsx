import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Ghiduri",
  description:
    "Ghiduri practice despre modele 3D, realitate augmentată la clasă, formate de fișiere și imprimare 3D.",
  alternates: { canonical: "/ghiduri" },
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ghiduri</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Cum lucrezi cu modele 3D, la clasă și acasă. Fără teorie inutilă.
        </p>
      </header>

      <ul className="stagger mt-10 space-y-4">
        {ARTICLES.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/ghiduri/${article.slug}`}
              className="tile group block p-6"
            >
              <h2 className="text-lg font-semibold tracking-tight group-hover:text-brand-700">
                {article.title}
              </h2>
              <p className="mt-2 text-ink-soft">{article.description}</p>
              <p className="mt-4 flex items-center gap-4 text-sm text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} aria-hidden />
                  {article.readingMinutes} min
                </span>
                <span className="flex items-center gap-1 font-medium text-brand-700">
                  Citește
                  <ArrowRight size={14} aria-hidden />
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
