import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getLibraryModel, isRehostable } from "@/lib/sketchfab";
import LibraryViewer from "@/components/LibraryViewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uid: string }>;
}): Promise<Metadata> {
  const { uid } = await params;
  const model = await getLibraryModel(uid);
  if (!model) return { title: "Model" };

  return {
    title: model.name,
    description: `Exploreaza in 3D si AR modelul ${model.name}.`,
    openGraph: { images: model.thumbnail ? [model.thumbnail] : undefined },
  };
}

export default async function LibraryModelPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const [cached, model, unlock] = await Promise.all([
    prisma.libraryModel.findUnique({ where: { uid } }),
    getLibraryModel(uid),
    userId
      ? prisma.libraryUnlock.findUnique({ where: { userId_uid: { userId, uid } } })
      : Promise.resolve(null),
  ]);

  if (!model) notFound();

  // Modelul se afiseaza doar celor care au platit deschiderea. Faptul ca
  // fisierul este deja in cache (adus de alt utilizator) nu da acces gratuit.
  const unlocked = Boolean(unlock);
  const isReady = cached?.status === "READY" && Boolean(cached.modelUrl) && unlocked;

  // Marcheaza accesarea: pe baza ei decide cron-ul ce se pastreaza in R2.
  if (isReady) {
    prisma.libraryModel
      .update({
        where: { uid },
        data: { views: { increment: 1 }, lastViewedAt: new Date() },
      })
      .catch(() => undefined);
  }

  const canHost = isRehostable(model.licenseSlug) && model.isDownloadable;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <Link
        href="/modele"
        className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden />
        Modele
      </Link>

      <div className="mt-5">
        {canHost ? (
          <LibraryViewer
            uid={uid}
            name={model.name}
            thumbnail={model.thumbnail}
            modelUrl={isReady ? cached!.modelUrl : null}
            iosUrl={isReady ? cached!.iosUrl : null}
            loggedIn={Boolean(userId)}
            alreadyUnlocked={unlocked}
          />
        ) : (
          <div className="flex h-[40vh] min-h-[18rem] items-center justify-center rounded-xl border border-rule bg-surface px-6 text-center">
            <div>
              <p className="font-medium">Model indisponibil</p>
              <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
                Licenta acestui model nu ne permite sa il gazduim pe platforma.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{model.name}</h1>

          {/* Atribuirea autorului este obligatorie la licentele CC-BY. */}
          <p className="mt-1.5 text-sm text-ink-soft">
            {model.author && (
              <>
                de{" "}
                {model.authorUrl ? (
                  <a
                    href={model.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-ink"
                  >
                    {model.author}
                  </a>
                ) : (
                  model.author
                )}
              </>
            )}
            {model.license && <> &middot; {model.license}</>}
            {model.faceCount && <> &middot; {model.faceCount.toLocaleString("ro-RO")} fete</>}
          </p>
        </div>

        <Link href="/creeaza" className="btn-primary">
          Creeaza propriul model
        </Link>
      </div>

      {model.description && (
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
          {model.description.slice(0, 400)}
          {model.description.length > 400 && "..."}
        </p>
      )}
    </div>
  );
}
