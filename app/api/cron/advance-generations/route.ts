import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { advanceGeneration } from "@/lib/generation-pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Lasam pollingul din browser sa se ocupe de lucrarile foarte recente. */
const MIN_AGE_MS = 60 * 1000;

/** Cate lucrari procesam intr-o rulare, ca sa nu depasim timpul rutei. */
const BATCH = 10;

/**
 * Duce mai departe lucrarile ramase in lucru.
 *
 * Fara acest job, o generare avanseaza doar cat timp utilizatorul tine pagina
 * deschisa: daca inchide tabul dupa ce a apasat "Creeaza", predictia se
 * termina la Replicate, dar nimeni nu mai descarca rezultatul, iar lucrarea
 * ramane vesnic "in procesare" cu creditele consumate.
 *
 * De rulat din minut in minut:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://edu3d.ro/api/cron/advance-generations
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const pending = await prisma.generation.findMany({
    where: {
      status: { in: ["PENDING", "PROCESSING"] },
      predictionId: { not: null },
      createdAt: { lt: new Date(Date.now() - MIN_AGE_MS) },
    },
    orderBy: { createdAt: "asc" },
    take: BATCH,
  });

  const result = { verificate: pending.length, finalizate: 0, esuate: 0, inLucru: 0 };

  for (const generation of pending) {
    const { generation: updated } = await advanceGeneration(generation);
    if (updated.status === "COMPLETED") result.finalizate++;
    else if (updated.status === "FAILED") result.esuate++;
    else result.inLucru++;
  }

  if (pending.length > 0) {
    console.log("[cron/advance-generations]", result);
  }

  return NextResponse.json(result);
}
