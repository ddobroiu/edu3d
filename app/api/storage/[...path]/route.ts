import { NextResponse } from "next/server";
import { getFromR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

/**
 * Serveste fisierele din R2 sub domeniul nostru. Asa nu depindem de accesul
 * public al bucket-ului, iar <model-viewer> nu are probleme de CORS.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = path.join("/");

  if (key.includes("..")) {
    return NextResponse.json({ error: "Cale invalida." }, { status: 400 });
  }

  try {
    const object = await getFromR2(key);
    if (!object.Body) {
      return NextResponse.json({ error: "Fisierul nu exista." }, { status: 404 });
    }

    return new NextResponse(object.Body.transformToWebStream(), {
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Content-Length": String(object.ContentLength ?? ""),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[storage]", key, error);
    return NextResponse.json({ error: "Fisierul nu exista." }, { status: 404 });
  }
}
