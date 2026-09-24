import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { uploadToR2 } from "@/lib/r2";
import {
  LIBRARY_OPEN_COST,
  InsufficientCreditsError,
  refundCredits,
  spendCredits,
} from "@/lib/credits";
import { MAX_MODEL_BYTES, getLibraryModel, isRehostable, requestDownload } from "@/lib/sketchfab";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daca o descarcare ramane blocata, o reluam dupa acest interval. */
const STALE_AFTER_MS = 3 * 60 * 1000;

/**
 * Aduce un model din biblioteca externa in platforma: il descarca o singura
 * data, il urca in R2 si il inregistreaza. De la al doilea vizitator incolo,
 * modelul se serveste de la noi si se afiseaza in viewerul propriu, cu AR.
 */
export async function POST(req: Request) {
  // Prima descarcare consuma banda si spatiu, deci o pot declansa doar
  // utilizatorii autentificati. Vizualizarea ulterioara este publica.
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Autentifica-te ca sa deschizi modelul in platforma." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const uid = String(body.uid || "").trim();
  if (!/^[a-zA-Z0-9]{8,64}$/.test(uid)) {
    return NextResponse.json({ error: "Identificator invalid." }, { status: 400 });
  }

  const userId = session.user.id;

  const [existing, unlock] = await Promise.all([
    prisma.libraryModel.findUnique({ where: { uid } }),
    prisma.libraryUnlock.findUnique({ where: { userId_uid: { userId, uid } } }),
  ]);

  // Deja platit de acest utilizator: il servim fara sa mai retinem nimic.
  if (unlock && existing?.status === "READY" && existing.modelUrl) {
    return NextResponse.json({
      status: "READY",
      modelUrl: existing.modelUrl,
      iosUrl: existing.iosUrl,
    });
  }

  // Prima deschidere a acestui model de catre acest utilizator: se plateste.
  if (!unlock) {
    try {
      await spendCredits({
        userId,
        amount: LIBRARY_OPEN_COST,
        type: "LIBRARY_OPEN",
        description: `Deschidere model din biblioteca: ${existing?.name ?? uid}`,
      });
      await prisma.libraryUnlock.create({
        data: { userId, uid, creditsPaid: LIBRARY_OPEN_COST },
      });
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return NextResponse.json(
          {
            error: `Ai nevoie de ${LIBRARY_OPEN_COST} credite ca sa deschizi modelul.`,
            needsCredits: true,
          },
          { status: 402 }
        );
      }
      throw error;
    }
  }

  // Fisierul este deja la noi: nu mai are rost sa il descarcam din nou.
  if (existing?.status === "READY" && existing.modelUrl) {
    return NextResponse.json({
      status: "READY",
      modelUrl: existing.modelUrl,
      iosUrl: existing.iosUrl,
    });
  }

  // Alt vizitator are deja descarcarea in curs.
  if (
    existing?.status === "PENDING" &&
    Date.now() - existing.createdAt.getTime() < STALE_AFTER_MS
  ) {
    return NextResponse.json({ status: "PENDING" });
  }

  const model = await getLibraryModel(uid);
  if (!model) {
    return NextResponse.json({ error: "Modelul nu a fost gasit." }, { status: 404 });
  }

  if (!isRehostable(model.licenseSlug) || !model.isDownloadable) {
    return NextResponse.json(
      { error: "Licenta acestui model nu ne permite sa il gazduim." },
      { status: 403 }
    );
  }

  // Marcam inainte de descarcare, ca doua cereri simultane sa nu o faca de doua ori.
  await prisma.libraryModel.upsert({
    where: { uid },
    create: {
      uid,
      name: model.name,
      author: model.author,
      authorUrl: model.authorUrl,
      license: model.license,
      licenseSlug: model.licenseSlug,
      thumbnailUrl: model.thumbnail,
      status: "PENDING",
    },
    update: { status: "PENDING", errorMessage: null, createdAt: new Date() },
  });

  try {
    const links = await requestDownload(uid);
    if (!links?.glb) {
      return NextResponse.json(await fail(uid, userId, "Modelul nu este disponibil in format GLB."), {
        status: 422,
      });
    }
    if (links.glbSize && links.glbSize > MAX_MODEL_BYTES) {
      return NextResponse.json(
        await fail(uid, userId, "Modelul depaseste 40 MB si nu poate fi incarcat in platforma."),
        { status: 413 }
      );
    }

    const response = await fetch(links.glb);
    if (!response.ok) {
      return NextResponse.json(await fail(uid, userId, "Descarcarea a esuat."), { status: 502 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_MODEL_BYTES) {
      return NextResponse.json(await fail(uid, userId, "Modelul depaseste 40 MB."), { status: 413 });
    }

    const modelUrl = await uploadToR2(`library/${uid}.glb`, buffer, "model/gltf-binary");

    // USDZ este optional; fara el, AR pe iPhone cade pe varianta implicita.
    let iosUrl: string | null = null;
    if (links.usdz) {
      try {
        const usdz = await fetch(links.usdz);
        if (usdz.ok) {
          const usdzBuffer = Buffer.from(await usdz.arrayBuffer());
          if (usdzBuffer.byteLength <= MAX_MODEL_BYTES) {
            iosUrl = await uploadToR2(`library/${uid}.usdz`, usdzBuffer, "model/vnd.usdz+zip");
          }
        }
      } catch {
        // Lipsa USDZ nu opreste publicarea modelului.
      }
    }

    await prisma.libraryModel.update({
      where: { uid },
      data: {
        status: "READY",
        modelUrl,
        iosUrl,
        fileSize: buffer.byteLength,
        cachedAt: new Date(),
        errorMessage: null,
      },
    });

    return NextResponse.json({ status: "READY", modelUrl, iosUrl });
  } catch (error) {
    console.error("[library/cache]", uid, error);
    return NextResponse.json(await fail(uid, userId, "Pregatirea modelului a esuat."), { status: 500 });
  }
}

/**
 * Marcheaza esecul si da inapoi creditele retinute pentru deschidere: nu se
 * plateste pentru un model care nu a putut fi adus. Stergem si randul de
 * deblocare, ca o incercare viitoare sa porneasca de la zero.
 */
async function fail(uid: string, userId: string, message: string) {
  const unlock = await prisma.libraryUnlock.findUnique({
    where: { userId_uid: { userId, uid } },
  });

  if (unlock) {
    await refundCredits({
      userId,
      amount: unlock.creditsPaid,
      description: "Returnare: modelul nu a putut fi deschis",
    });
    await prisma.libraryUnlock.delete({ where: { id: unlock.id } });
  }

  await prisma.libraryModel.update({
    where: { uid },
    data: { status: "FAILED", errorMessage: message },
  });

  return { status: "FAILED", error: message };
}
