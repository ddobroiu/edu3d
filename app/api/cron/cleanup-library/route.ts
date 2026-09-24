import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromR2, keyFromUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Un model neaccesat mai mult de atat nu merita spatiul din R2. */
const UNUSED_DAYS = 30;

/** Plafon total pentru cache-ul bibliotecii. Peste el, evacuam cele mai vechi. */
const MAX_CACHE_BYTES = 20 * 1024 * 1024 * 1024; // 20 GB

/**
 * Elibereaza spatiul ocupat de biblioteca. Modelele sunt aduse la cerere si
 * pot fi aduse din nou oricand, deci stergerea nu pierde nimic definitiv --
 * doar cateva secunde la urmatoarea accesare.
 *
 * Creatiile utilizatorilor (edu3d_generations) NU sunt atinse: acelea sunt
 * platite cu credite si raman in cont.
 *
 * De rulat zilnic:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://edu3d.ro/api/cron/cleanup-library
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const evicted: string[] = [];
  const keys: string[] = [];

  function collect(model: { uid: string; modelUrl: string | null; iosUrl: string | null }) {
    for (const url of [model.modelUrl, model.iosUrl]) {
      const key = url ? keyFromUrl(url) : null;
      if (key) keys.push(key);
    }
    evicted.push(model.uid);
  }

  // 1. Modelele neatinse de mult timp.
  const cutoff = new Date(Date.now() - UNUSED_DAYS * 24 * 60 * 60 * 1000);
  const stale = await prisma.libraryModel.findMany({
    where: {
      status: "READY",
      OR: [{ lastViewedAt: { lt: cutoff } }, { lastViewedAt: null, cachedAt: { lt: cutoff } }],
    },
    select: { uid: true, modelUrl: true, iosUrl: true },
  });
  stale.forEach(collect);

  // 2. Daca tot depasim plafonul, evacuam in ordinea ultimei accesari.
  const remaining = await prisma.libraryModel.findMany({
    where: { status: "READY", uid: { notIn: evicted.length ? evicted : ["-"] } },
    orderBy: [{ lastViewedAt: "asc" }, { cachedAt: "asc" }],
    select: { uid: true, modelUrl: true, iosUrl: true, fileSize: true },
  });

  let total = remaining.reduce((sum, model) => sum + (model.fileSize ?? 0), 0);
  for (const model of remaining) {
    if (total <= MAX_CACHE_BYTES) break;
    total -= model.fileSize ?? 0;
    collect(model);
  }

  // 3. Incercarile esuate nu ocupa spatiu in R2, dar nu au rost sa ramana in
  //    tabel: la o noua accesare modelul se incearca oricum din nou.
  const failed = await prisma.libraryModel.deleteMany({
    where: { status: "FAILED", createdAt: { lt: cutoff } },
  });

  if (evicted.length === 0) {
    return NextResponse.json({
      evicted: 0,
      failedRemoved: failed.count,
      message: "Nimic de eliberat.",
    });
  }

  await deleteFromR2(keys);
  await prisma.libraryModel.deleteMany({ where: { uid: { in: evicted } } });

  console.log(`[cron/cleanup-library] ${evicted.length} modele evacuate, ${keys.length} fisiere sterse`);

  return NextResponse.json({
    evicted: evicted.length,
    filesDeleted: keys.length,
    failedRemoved: failed.count,
    cacheBytesRemaining: total,
  });
}
