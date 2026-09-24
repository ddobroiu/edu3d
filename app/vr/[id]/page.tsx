import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canViewGeneration } from "@/lib/access";
import VRScene from "@/components/VRSceneClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vizualizare VR",
  description: "Exploreaza modelul in realitate virtuala.",
};

/**
 * Aceeasi ruta serveste si creatiile utilizatorilor, si modelele aduse din
 * biblioteca: ambele au un identificator opac si un GLB gazduit de noi.
 */
async function resolveModel(id: string, userId?: string | null) {
  const generation = await canViewGeneration(id, userId);
  if (generation?.status === "COMPLETED" && generation.modelUrl) {
    return {
      modelUrl: generation.modelUrl,
      title: generation.prompt || "Model 3D",
      backHref: `/model/${generation.id}`,
      backLabel: "Inapoi la model",
    };
  }

  // Modelele din biblioteca se vad doar dupa ce deschiderea a fost platita.
  const unlock = userId
    ? await prisma.libraryUnlock.findUnique({ where: { userId_uid: { userId, uid: id } } })
    : null;
  if (!unlock) return null;

  const library = await prisma.libraryModel.findFirst({
    where: { uid: id, status: "READY" },
    select: { uid: true, name: true, modelUrl: true },
  });
  if (library?.modelUrl) {
    return {
      modelUrl: library.modelUrl,
      title: library.name,
      backHref: `/modele/${library.uid}`,
      backLabel: "Inapoi la model",
    };
  }

  return null;
}

export default async function VRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const model = await resolveModel(id, session?.user?.id);

  if (!model) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Link
          href={model.backHref}
          className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden />
          {model.backLabel}
        </Link>
        <h1 className="truncate text-lg font-medium">{model.title}</h1>
      </div>

      <div className="h-[70vh] min-h-[26rem]">
        <VRScene url={model.modelUrl} alt={model.title} />
      </div>

      <div className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
        <p>
          Cu o casca de realitate virtuala, deschide pagina in browserul castii si apasa
          &bdquo;Intra in VR&rdquo;. Fara casca, modelul se roteste cu mouse-ul sau cu degetul.
        </p>
      </div>
    </div>
  );
}
