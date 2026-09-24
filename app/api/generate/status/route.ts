import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { advanceGeneration, serializeGeneration } from "@/lib/generation-pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Avanseaza pipeline-ul cu un pas si raporteaza starea. Frontend-ul apeleaza
 * ruta la cateva secunde, deci niciun request nu ramane blocat cat dureaza
 * toata generarea.
 *
 * Aceeasi logica ruleaza si din /api/cron/advance-generations, ca lucrarile sa
 * ajunga la capat chiar daca utilizatorul a inchis pagina.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Lipseste id-ul." }, { status: 400 });

  const generation = await prisma.generation.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!generation) {
    return NextResponse.json({ error: "Creatia nu a fost gasita." }, { status: 404 });
  }

  const { generation: updated, error } = await advanceGeneration(generation);

  return NextResponse.json({
    ...serializeGeneration(updated),
    // Cat timp lucrarea nu s-a incheiat, frontend-ul trebuie sa mai intrebe.
    status: updated.status,
    ...(error ? { error } : {}),
  });
}
