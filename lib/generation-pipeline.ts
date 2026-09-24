import { prisma } from "./db";
import { refundCredits } from "./credits";
import {
  extractImageUrl,
  extractModelUrl,
  getPrediction,
  startModelGeneration,
} from "./replicate";
import { uploadToR2 } from "./r2";

/** Dupa atatea esecuri de salvare renuntam si returnam creditele. */
const MAX_PROCESS_ATTEMPTS = 5;

export type GenerationRow = Awaited<ReturnType<typeof prisma.generation.findFirstOrThrow>>;

export type AdvanceResult = {
  generation: GenerationRow;
  /** Mesaj pentru utilizator, doar cand lucrarea a esuat definitiv. */
  error?: string;
};

/**
 * Duce o generare cu un pas mai departe:
 *
 *   IMAGE reusit -> porneste etapa MODEL cu imaginea obtinuta
 *   MODEL reusit -> descarca GLB-ul, il urca in R2, marcheaza COMPLETED
 *   esec         -> returneaza creditele si marcheaza FAILED
 *
 * Este apelata din doua locuri: ruta de status (cat timp utilizatorul are
 * pagina deschisa) si jobul din /api/cron/advance-generations (ca lucrarile sa
 * ajunga la capat si daca browserul a fost inchis).
 */
export async function advanceGeneration(generation: GenerationRow): Promise<AdvanceResult> {
  if (generation.status === "COMPLETED" || generation.status === "FAILED") {
    return { generation };
  }
  if (!generation.predictionId) {
    return { generation };
  }

  try {
    const prediction = await getPrediction(generation.predictionId);

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return failGeneration(generation, String(prediction.error || "Generare esuata"));
    }

    if (prediction.status !== "succeeded") {
      return { generation };
    }

    // --- etapa 1 gata: avem imaginea, pornim conversia in 3D ---
    if (generation.stage === "IMAGE") {
      const imageUrl = extractImageUrl(prediction.output);
      if (!imageUrl) {
        return failGeneration(generation, "Imaginea nu a putut fi citita.");
      }

      const next = await startModelGeneration(imageUrl);
      const updated = await prisma.generation.update({
        where: { id: generation.id },
        data: { sourceImageUrl: imageUrl, stage: "MODEL", predictionId: next.id },
      });
      return { generation: updated };
    }

    // --- etapa 2 gata: mutam GLB-ul de la Replicate in storage-ul nostru ---
    const modelUrl = extractModelUrl(prediction.output);
    if (!modelUrl) {
      return failGeneration(generation, "Modelul 3D nu a putut fi citit.");
    }

    // Predictia a reusit; de aici incolo orice eroare este de partea noastra
    // (retea sau storage). O toleram de cateva ori, dar nu la nesfarsit: altfel
    // lucrarea ar ramane vesnic "in procesare", cu creditele blocate.
    try {
      const response = await fetch(modelUrl);
      if (!response.ok) throw new Error(`Descarcare esuata: ${response.status}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      const storedUrl = await uploadToR2(
        `generations/${generation.id}.glb`,
        buffer,
        "model/gltf-binary"
      );

      const updated = await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: "COMPLETED",
          modelUrl: storedUrl,
          thumbnailUrl: generation.sourceImageUrl,
          completedAt: new Date(),
        },
      });
      return { generation: updated };
    } catch (error) {
      console.error("[pipeline] salvare esuata:", generation.id, error);

      const attempts = generation.processAttempts + 1;
      if (attempts >= MAX_PROCESS_ATTEMPTS) {
        return failGeneration(generation, "Modelul a fost generat, dar nu a putut fi salvat.");
      }

      const updated = await prisma.generation.update({
        where: { id: generation.id },
        data: { processAttempts: attempts },
      });
      return { generation: updated };
    }
  } catch (error) {
    // Eroare la interogarea Replicate: aproape sigur trecatoare, mai incercam.
    console.error("[pipeline] interogare esuata:", generation.id, error);
    return { generation };
  }
}

async function failGeneration(
  generation: GenerationRow,
  message: string
): Promise<AdvanceResult> {
  // `refunded` opreste dubla returnare daca mai vine un apel.
  if (!generation.refunded) {
    await refundCredits({
      userId: generation.userId,
      classroomId: generation.classroomId,
      amount: generation.creditsCost,
      description: "Returnare: generarea nu a reusit",
    });
  }

  const updated = await prisma.generation.update({
    where: { id: generation.id },
    data: { status: "FAILED", errorMessage: message, refunded: true },
  });

  return {
    generation: updated,
    error: "Nu am reusit sa cream modelul. Creditele ti-au fost returnate.",
  };
}

export function serializeGeneration(generation: GenerationRow) {
  return {
    id: generation.id,
    status: generation.status,
    stage: generation.stage,
    modelUrl: generation.modelUrl,
    thumbnailUrl: generation.thumbnailUrl,
    sourceImageUrl: generation.sourceImageUrl,
    prompt: generation.prompt,
  };
}
