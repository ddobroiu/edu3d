import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { ARTICLES, getArticle, type ArticleBlock } from "@/lib/articles";
import { baseUrl } from "@/lib/stripe";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Ghid" };

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/ghiduri/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      publishedTime: article.published,
      modifiedTime: article.updated,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) notFound();

  const related = article.related
    .map((relatedSlug) => getArticle(relatedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  // Datele structurate ajuta ghidul sa apara cu intrebarile in rezultate.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.description,
        datePublished: article.published,
        dateModified: article.updated,
        inLanguage: "ro-RO",
        mainEntityOfPage: `${baseUrl()}/ghiduri/${article.slug}`,
        author: { "@type": "Organization", name: "EDU3D" },
        publisher: { "@type": "Organization", name: "EDU3D" },
      },
      {
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/ghiduri"
        className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden />
        Ghiduri
      </Link>

      <article className="animate-in mt-6">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {article.title}
        </h1>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-soft">
          <Clock size={14} aria-hidden />
          {article.readingMinutes} minute de citit
        </p>

        <p className="mt-6 border-l-2 border-brand-500 pl-4 text-lg leading-relaxed text-ink-soft">
          {article.intro}
        </p>

        <div className="mt-8">
          {article.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </div>

        <section className="mt-12 border-t border-rule pt-8">
          <h2 className="text-xl font-semibold tracking-tight">Întrebări frecvente</h2>
          <dl className="mt-5 space-y-5">
            {article.faq.map((item) => (
              <div key={item.q}>
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-1 leading-relaxed text-ink-soft">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>

      {related.length > 0 && (
        <section className="mt-12 border-t border-rule pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Citește mai departe
          </h2>
          <ul className="mt-4 space-y-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/ghiduri/${item.slug}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 rounded-xl border border-rule bg-surface p-6 text-center">
        <p className="font-medium">Încearcă tu</p>
        <p className="mt-1 text-sm text-ink-soft">
          Scrie ce vrei să vezi și ai modelul în două minute.
        </p>
        <Link href="/creeaza" className="btn-primary mt-4">
          Deschide atelierul
        </Link>
      </div>
    </div>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-10 mb-3 text-2xl font-semibold tracking-tight">{block.text}</h2>;
    case "h3":
      return <h3 className="mt-7 mb-2 text-lg font-semibold tracking-tight">{block.text}</h3>;
    case "p":
      return <p className="mb-4 leading-relaxed text-ink-soft">{block.text}</p>;
    case "ul":
      return (
        <ul className="mb-4 space-y-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed text-ink-soft">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mb-4 space-y-2">
          {block.items.map((item, index) => (
            <li key={item} className="flex gap-3 leading-relaxed text-ink-soft">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      );
    case "note":
      return (
        <p className="my-6 rounded-xl border border-brand-200 bg-brand-50 p-4 leading-relaxed">
          {block.text}
        </p>
      );
  }
}
