import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Calendar } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canViewGeneration } from "@/lib/access";
import ModelViewer from "@/components/ModelViewer";
import ViewOptions from "@/components/ViewOptions";
import PublishToggle from "@/components/PublishToggle";
import Avatar from "@/components/Avatar";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const generation = await prisma.generation.findFirst({
    where: { id, isPublic: true },
    select: { prompt: true, thumbnailUrl: true },
  });

  if (!generation) return { title: "Model 3D" };

  return {
    title: generation.prompt || "Model 3D",
    description: `Exploreaza in 3D si VR modelul „${generation.prompt}”, creat pe edu3d.`,
    openGraph: {
      images: generation.thumbnailUrl ? [generation.thumbnailUrl] : undefined,
    },
  };
}

export default async function ModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const generation = await canViewGeneration(id, session?.user?.id);

  if (!generation || generation.status !== "COMPLETED" || !generation.modelUrl) {
    notFound();
  }

  // Contorul de vizualizari nu trebuie sa blocheze randarea paginii.
  prisma.generation
    .update({ where: { id }, data: { views: { increment: 1 } } })
    .catch(() => undefined);

  const isOwner = generation.userId === session?.user?.id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card overflow-hidden p-3">
          <ModelViewer
            src={generation.modelUrl}
            alt={generation.prompt || "Model 3D"}
            poster={generation.thumbnailUrl}
            className="h-[30rem] w-full"
          />
        </div>

        <aside className="space-y-4">
          <div className="card p-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {generation.prompt || "Model 3D"}
            </h1>

            {generation.child && (
              <p className="mt-3 flex items-center gap-2 text-ink-soft">
                <Avatar name={generation.child.name} color={generation.child.avatar} size="sm" />
                realizat de {generation.child.name.split(" ")[0]}
              </p>
            )}

            <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
              <Calendar size={16} aria-hidden />
              {formatDate(generation.createdAt)}
            </p>

            <div className="mt-5 space-y-3">
              <ViewOptions
                arHref={`/model/${generation.id}`}
                vrHref={`/vr/${generation.id}`}
              />
              {isOwner && (
                <a href={generation.modelUrl} download className="btn-ghost w-full">
                  <Download size={18} aria-hidden />
                  Descarca GLB
                </a>
              )}
            </div>
          </div>

          {isOwner && (
            <PublishToggle generationId={generation.id} initialPublic={generation.isPublic} />
          )}

          <div className="card bg-brand-50 p-6">
            <h2 className="font-medium">Cum il explorezi</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>&bull; Trage cu mouse-ul sau cu degetul ca sa rotesti modelul</li>
              <li>
                &bull; <strong>AR</strong> &mdash; de pe telefon, il asezi in camera ta si te
                plimbi in jurul lui. De pe calculator, scanezi codul QR.
              </li>
              <li>
                &bull; <strong>VR</strong> &mdash; cu o casca, intri tu in scena, langa model.
              </li>
            </ul>
          </div>

          <Link href="/creeaza" className="btn-sun w-full">
            Creeaza propriul model
          </Link>
        </aside>
      </div>
    </div>
  );
}
