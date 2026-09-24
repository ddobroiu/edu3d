import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB, suficient pentru o poza facuta cu telefonul
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nu am primit niciun fisier." }, { status: 400 });
    }

    const extension = ALLOWED.get(file.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Accepta doar poze JPG, PNG sau WEBP." },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Poza este prea mare (maximum 8 MB)." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${session.user.id}/${randomUUID()}.${extension}`;
    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json({ error: "Incarcarea a esuat. Incearca din nou." }, { status: 500 });
  }
}
