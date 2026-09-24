import { translateToEnglish } from "./replicate";

/**
 * Sursa externa pentru biblioteca de modele (Sketchfab). O folosim doar pentru
 * cautare si pentru descarcarea initiala a fisierului; din momentul in care un
 * model a fost adus in R2, platforma il serveste singura, prin viewerul propriu.
 * Vizualizarea nu costa credite.
 */

const API = "https://api.sketchfab.com/v3";

/**
 * Licentele sub care avem voie sa descarcam fisierul si sa il servim de pe
 * domeniul nostru, intr-un produs platit:
 *   cc0    - domeniu public, fara conditii
 *   by     - atribuire obligatorie
 *   by-sa  - atribuire, iar modificarile se distribuie la fel
 *
 * Sunt excluse intentionat NC (interzice uzul comercial) si ND (interzice
 * lucrarile derivate). Atribuirea autorului se afiseaza pe pagina modelului.
 */
export const ALLOWED_LICENSES = ["cc0", "by", "by-sa"];

/**
 * Peste aceasta limita modelul se incarca prea greu in browser si depaseste
 * timpul rutei de descarcare. Sketchfab ignora parametrul `archives_max_size`,
 * asa ca filtram noi rezultatele: in grila nu apare niciun model pe care nu il
 * putem deschide.
 */
export const MAX_MODEL_BYTES = 40 * 1024 * 1024;

export function isRehostable(licenseSlug?: string | null) {
  return Boolean(licenseSlug && ALLOWED_LICENSES.includes(licenseSlug));
}

export type LibraryModel = {
  uid: string;
  name: string;
  thumbnail: string | null;
  author: string | null;
  faceCount: number | null;
};

export type LibraryPage = {
  items: LibraryModel[];
  nextCursor: string | null;
  /** Interogarea efectiv trimisa la Sketchfab, dupa traducere. */
  usedQuery: string | null;
};

/** Traducerile se repeta mult intre cautari, deci le tinem in memorie. */
const translationCache = new Map<string, string>();

function looksRomanian(text: string) {
  if (/[ăâîșțĂÂÎȘȚ]/.test(text)) return true;
  return /\b(un|o|de|cu|si|pentru|masina|casa|copac|floare|dinozaur|planeta|munte)\b/i.test(text);
}

/** Sketchfab indexeaza in engleza; traducem doar cand pare necesar si nu blocam. */
async function toSearchQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed || !looksRomanian(trimmed)) return trimmed;

  const cached = translationCache.get(trimmed.toLowerCase());
  if (cached) return cached;

  try {
    const translated = await Promise.race([
      translateToEnglish(trimmed),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);

    if (translated) {
      translationCache.set(trimmed.toLowerCase(), translated);
      return translated;
    }
  } catch {
    // Traducerea este optionala; la esec cautam cu textul original.
  }

  return trimmed;
}

function pickThumbnail(model: Record<string, any>): string | null {
  const images = model?.thumbnails?.images;
  if (!Array.isArray(images) || images.length === 0) return null;

  // Alegem cea mai mica imagine de peste 400px, ca sa nu incarcam inutil grila.
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((image) => (image.width ?? 0) >= 400) ?? sorted[sorted.length - 1])?.url ?? null;
}

export async function searchLibrary(
  query: string,
  cursor?: string | null
): Promise<LibraryPage> {
  const apiKey = process.env.SKETCHFAB_API_KEY;
  if (!apiKey) {
    console.warn("[sketchfab] SKETCHFAB_API_KEY lipseste; biblioteca ramane goala.");
    return { items: [], nextCursor: null, usedQuery: null };
  }

  const usedQuery = await toSearchQuery(query);

  // Cerem mai multe decat afisam, pentru ca o parte cad la filtrul de marime.
  const params = new URLSearchParams({
    type: "models",
    count: "32",
    sort_by: "-likeCount",
    downloadable: "true",
  });

  // Doar licentele care permit re-gazduirea pe o platforma comerciala.
  for (const slug of ALLOWED_LICENSES) params.append("license", slug);

  if (usedQuery) {
    params.set("q", usedQuery);
  } else {
    // Fara cautare aratam selectia redactionala Sketchfab.
    params.set("staffpicked", "true");
  }
  if (cursor) params.set("cursor", cursor);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API}/search?${params}`, {
      headers: { Authorization: `Token ${apiKey}` },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error("[sketchfab] cautare esuata:", response.status);
      return { items: [], nextCursor: null, usedQuery };
    }

    const data = await response.json();
    const items: LibraryModel[] = (data.results ?? [])
      // Fara arhiva GLB nu avem ce afisa, iar peste limita nu putem descarca.
      .filter((model: Record<string, any>) => {
        const size = model.archives?.glb?.size;
        return typeof size === "number" && size > 0 && size <= MAX_MODEL_BYTES;
      })
      .map((model: Record<string, any>) => ({
        uid: model.uid,
        name: model.name || "Model 3D",
        thumbnail: pickThumbnail(model),
        author: model.user?.displayName ?? null,
        faceCount: typeof model.faceCount === "number" ? model.faceCount : null,
      }));

    return { items, nextCursor: data.cursors?.next ?? null, usedQuery };
  } catch (error) {
    console.error("[sketchfab] cautare esuata:", error);
    return { items: [], nextCursor: null, usedQuery };
  }
}

export async function getLibraryModel(uid: string) {
  const apiKey = process.env.SKETCHFAB_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`${API}/models/${uid}`, {
      headers: { Authorization: `Token ${apiKey}` },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;

    const model = await response.json();
    return {
      uid: model.uid as string,
      name: (model.name as string) || "Model 3D",
      description: (model.description as string) || "",
      author: model.user?.displayName ?? null,
      authorUrl: model.user?.profileUrl ?? null,
      license: model.license?.label ?? null,
      licenseSlug: model.license?.slug ?? null,
      isDownloadable: Boolean(model.isDownloadable),
      faceCount: typeof model.faceCount === "number" ? model.faceCount : null,
      thumbnail: pickThumbnail(model),
    };
  } catch (error) {
    console.error("[sketchfab] model indisponibil:", error);
    return null;
  }
}

export type DownloadLinks = {
  glb: string | null;
  glbSize: number | null;
  usdz: string | null;
};

/**
 * Cere linkurile temporare de descarcare. Le folosim o singura data, ca sa
 * mutam fisierul in R2; dupa aceea modelul se serveste de la noi.
 */
export async function requestDownload(uid: string): Promise<DownloadLinks | null> {
  const apiKey = process.env.SKETCHFAB_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`${API}/models/${uid}/download`, {
      headers: { Authorization: `Token ${apiKey}` },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[sketchfab] descarcare refuzata:", response.status);
      return null;
    }

    const data = await response.json();
    return {
      glb: data.glb?.url ?? null,
      glbSize: typeof data.glb?.size === "number" ? data.glb.size : null,
      usdz: data.usdz?.url ?? null,
    };
  } catch (error) {
    console.error("[sketchfab] descarcare esuata:", error);
    return null;
  }
}
