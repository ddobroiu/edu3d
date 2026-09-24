import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { LANDING_PAGES, getLandingPage } from "@/lib/landing";
import { getArticle } from "@/lib/articles";


/**
 * Paginile dedicate din lib/landing.ts. Fiind un segment dinamic la radacina,
 * prinde doar adresele generate mai jos; orice alta cale ajunge la 404.
 */
export function generateStaticParams() {
  return LANDING_PAGES.map((page) => ({ landing: page.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ landing: string }>;
}): Promise<Metadata> {
  const { landing } = await params;
  const page = getLandingPage(landing);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.title, description: page.description },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ landing: string }> }) {
  const { landing } = await params;
  const page = getLandingPage(landing);

  if (!page) notFound();

  const guides = page.guides
    .map((slug) => getArticle(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="chalkboard relative text-white">
        <div className="chalk-grid absolute inset-0" aria-hidden />
        <div className="animate-in relative mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {page.h1}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
            {page.lead}
          </p>
          <Link href={page.cta.href} className="btn mt-9 bg-white text-ink hover:bg-white/90">
            {page.cta.label}
            <ArrowRight size={17} aria-hidden />
          </Link>
        </div>
        <div className="h-2 bg-gradient-to-b from-amber-900/70 to-amber-950/80" aria-hidden />
      </section>

      <div className="paper-grid">
        <div className="mx-auto max-w-3xl px-5 py-16">
          {page.sections.map((section) => (
            <section key={section.heading} className="mb-12">
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{section.body}</p>

              {section.items && (
                <ul className="mt-4 space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed text-ink-soft">
                      <Check size={17} className="mt-1 shrink-0 text-brand-600" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="border-t border-rule pt-10">
            <h2 className="text-2xl font-semibold tracking-tight">Întrebări frecvente</h2>
            <dl className="mt-6 space-y-5">
              {page.faq.map((item) => (
                <div key={item.q}>
                  <dt className="font-medium">{item.q}</dt>
                  <dd className="mt-1 leading-relaxed text-ink-soft">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {guides.length > 0 && (
            <section className="mt-12 border-t border-rule pt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Ghiduri legate
              </h2>
              <ul className="mt-4 space-y-3">
                {guides.map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={`/ghiduri/${guide.slug}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {guide.title}
                    </Link>
                    <p className="text-sm text-ink-soft">{guide.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-12 rounded-xl border border-rule bg-white p-6 text-center">
            <p className="font-medium">Gata de încercat?</p>
            <p className="mt-1 text-sm text-ink-soft">
              10 credite la înregistrare, fără card.
            </p>
            <Link href={page.cta.href} className="btn-primary mt-4">
              {page.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
