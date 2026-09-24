import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  InsufficientCreditsError,
  generationCost,
  refundCredits,
  spendCredits,
} from "@/lib/credits";
import { AccessError, resolveGenerationContext } from "@/lib/access";
import { checkPrompt } from "@/lib/moderation";
import { startImageGeneration, startModelGeneration, translateToEnglish } from "@/lib/replicate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }
  const userId = session.user.id;

  let context;
  let prompt = "";
  let mode: "TEXT" | "IMAGE";
  let sourceImageUrl: string | null = null;
  let subject: string | null = null;

  try {
    const body = await req.json();
    mode = body.mode === "IMAGE" ? "IMAGE" : "TEXT";
    subject = body.subject ? String(body.subject) : null;

    if (mode === "TEXT") {
      prompt = String(body.prompt || "").trim();
      const check = checkPrompt(prompt);
      if (!check.ok) {
        return NextResponse.json({ error: check.reason }, { status: 400 });
      }
    } else {
      sourceImageUrl = String(body.imageUrl || "").trim();
      if (!sourceImageUrl) {
        return NextResponse.json({ error: "Incarca mai intai o poza." }, { status: 400 });
      }
      // Acceptam doar fisiere urcate prin /api/upload, nu orice adresa de pe internet.
      if (!sourceImageUrl.includes("/api/storage/uploads/")) {
        return NextResponse.json({ error: "Imaginea nu este valida." }, { status: 400 });
      }
    }

    context = await resolveGenerationContext(userId, body.childId, body.classroomId);
  } catch (error) {
    if (error instanceof AccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Cerere invalida." }, { status: 400 });
  }

  // Generarea din fotografie costa mai mult decat cea din text.
  const cost = generationCost(mode);
  const description =
    mode === "TEXT"
      ? `Creatie 3D: ${prompt.slice(0, 60)}`
      : "Creatie 3D dintr-o fotografie";

  // Creditele se retin inainte de a porni generarea si se returneaza daca pornirea esueaza.
  try {
    await spendCredits({
      userId,
      classroomId: context.classroomId,
      amount: cost,
      description,
    });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: error.message, needsCredits: true }, { status: 402 });
    }
    throw error;
  }

  try {
    let promptEn: string | null = null;
    let prediction;
    let stage: "IMAGE" | "MODEL";

    if (mode === "TEXT") {
      promptEn = await translateToEnglish(prompt);
      prediction = await startImageGeneration(promptEn);
      stage = "IMAGE";
    } else {
      prediction = await startModelGeneration(sourceImageUrl!);
      stage = "MODEL";
    }

    const generation = await prisma.generation.create({
      data: {
        userId,
        childId: context.childId,
        classroomId: context.classroomId,
        mode,
        prompt: mode === "TEXT" ? prompt : null,
        promptEn,
        sourceImageUrl,
        subject,
        status: "PROCESSING",
        stage,
        predictionId: prediction.id,
        creditsCost: cost,
      },
      select: { id: true, status: true, stage: true },
    });

    return NextResponse.json(generation);
  } catch (error) {
    console.error("[generate] pornirea a esuat, returnez creditele:", error);
    await refundCredits({
      userId,
      classroomId: context.classroomId,
      amount: cost,
      description: "Returnare: generarea nu a putut porni",
    });
    return NextResponse.json(
      { error: "Atelierul este ocupat chiar acum. Creditele ti-au fost returnate, incearca din nou." },
      { status: 502 }
    );
  }
}
