import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Box, Search } from "lucide-react";
import { searchLibrary } from "@/lib/sketchfab";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Modele",
  description: "Peste un milion de modele 3D, plus lucrarile create pe edu3d.",
};

export const dynamic = "force-dynamic";

const SUGGESTIONS = ["dinozaur", "planeta", "inima", "vulcan", "piramida", "celula"];

export default async function ModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cursor?: string; tip?: string }>;
}) {
  const { q = "", cursor, tip } = await searchParams;
  const showCreations = tip === "creatii";

  const [library, creations] = await Promise.all([
    showCreations ? Promise.resolve(null) : searchLibrary(q, cursor),
    showCreations
      ? prisma.generation.findMany({
          where: { isPublic: true, status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 24,
          select: { id: true, prompt: true, thumbnailUrl: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Modele</h1>
          <p className="mt-2 text-ink-soft">
            Peste un milion de modele 3D, gata de explorat.
          </p>
        </div>

        <div className="flex rounded-lg border border-rule p-0.5 text-sm">
          <Link
            href="/modele"
            className={cn(
              "rounded-md px-3.5 py-1.5 transition-colors",
              !showCreations ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
            )}
          >
            Biblioteca
          </Link>
          <Link
            href="/modele?tip=creatii"
            className={cn(
              "rounded-md px-3.5 py-1.5 transition-colors",
              showCreations ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
            )}
          >
            Creatii edu3d
          </Link>
        </div>
      </header>

      {showCreations ? (
        <section className="mt-10">
          {creations.length === 0 ? (
            <EmptyState
              title="Nicio creatie publica inca"
              action={{ href: "/creeaza", label: "Creeaza primul model" }}
            />
          ) : (
            <ul className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {creations.map((item) => (
                <li key={item.id}>
                  <Link href={`/model/${item.id}`} className="tile block">
                    <Thumb src={item.thumbnailUrl} alt={item.prompt || "Model 3D"} />
                    <p className="truncate px-3 py-2.5 text-sm font-medium">
                      {item.prompt || "Model 3D"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {/* Cautarea merge si fara JavaScript. */}
          <form action="/modele" className="mt-8 flex gap-2">
            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
                aria-hidden
              />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Cauta un model: dinozaur, planeta, inima..."
                className="input pl-10"
                aria-label="Cauta in biblioteca"
              />
            </div>
            <button type="submit" className="btn-primary">
              Cauta
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((term) => (
              <Link
                key={term}
                href={`/modele?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-rule px-3 py-1 text-xs text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
              >
                {term}
              </Link>
            ))}
          </div>

          <section className="mt-10">
            {library && library.items.length === 0 ? (
              <EmptyState
                title={q ? `Niciun rezultat pentru „${q}”` : "Biblioteca nu este disponibila"}
                hint={
                  q
                    ? "Incearca un alt cuvant."
                    : "Verifica cheia SKETCHFAB_API_KEY din environment."
                }
              />
            ) : (
              <>
                <ul className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {library?.items.map((model) => (
                    <li key={model.uid}>
                      <Link href={`/modele/${model.uid}`} className="tile block">
                        <Thumb src={model.thumbnail} alt={model.name} />
                        <div className="px-3 py-2.5">
                          <p className="truncate text-sm font-medium">{model.name}</p>
                          {model.author && (
                            <p className="mt-0.5 truncate text-xs text-ink-soft">{model.author}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                {library?.nextCursor && (
                  <div className="mt-10 flex justify-center">
                    <Link
                      href={`/modele?q=${encodeURIComponent(q)}&cursor=${encodeURIComponent(library.nextCursor)}`}
                      className="btn-ghost"
                    >
                      Vezi mai multe
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative aspect-[4/3] bg-surface">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />
      ) : (
        <div className="grid h-full place-items-center text-ink-soft/40" aria-hidden>
          <Box size={32} />
        </div>
      )}
    </div>
  );
}

function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-rule py-20 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1.5 text-sm text-ink-soft">{hint}</p>}
      {action && (
        <Link href={action.href} className="btn-primary mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}
