import Replicate from "replicate";

/**
 * Pipeline-ul de generare:
 *   text  -> Flux (imagine 1024x1024) -> Trellis (GLB)
 *   poza  -> Trellis (GLB)
 *
 * Cele doua etape sunt pornite separat si urmarite prin /api/generate/status,
 * ca sa nu tinem niciodata un request HTTP blocat minute intregi.
 */

export const IMAGE_MODEL = "black-forest-labs/flux-1.1-pro";
export const MODEL_3D_VERSION =
  "e8f6c45206993f297372f5436b90350817bd9b4a0d52d2a76df50c1c8afa2b3c"; // Trellis image-to-3D
const TRANSLATE_MODEL = "meta/meta-llama-3-8b-instruct";

let client: Replicate | null = null;

export function getReplicate() {
  if (!client) {
    const auth = process.env.REPLICATE_API_TOKEN;
    if (!auth) throw new Error("REPLICATE_API_TOKEN lipseste din environment.");
    client = new Replicate({ auth });
  }
  return client;
}

/**
 * Copiii scriu in romana, iar modelele de imagine inteleg mult mai bine engleza.
 * Daca traducerea esueaza, mergem mai departe cu textul original.
 */
export async function translateToEnglish(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  try {
    const output = await getReplicate().run(TRANSLATE_MODEL, {
      input: {
        prompt:
          "Translate the following text to English. It was written by a child describing an object " +
          "they want to see as a 3D model. Reply with ONLY the translation, no quotes, no explanation.\n\n" +
          `Text: ${trimmed}`,
        max_tokens: 120,
        temperature: 0.1,
      },
    });

    const raw = Array.isArray(output) ? output.join("") : String(output);
    const clean = raw.trim().replace(/^["'\s]+|["'\s]+$/g, "");
    return clean || trimmed;
  } catch (error) {
    console.error("[replicate] traducerea a esuat:", error);
    return trimmed;
  }
}

/** Stilul vizual al platformei: prietenos, colorat, fundal curat pentru extragerea 3D. */
export function buildImagePrompt(subject: string) {
  return (
    `A single ${subject}, centered, full object visible, friendly educational illustration for children, ` +
    "soft rounded shapes, bright saturated colors, clean plain white background, even studio lighting, " +
    "3d render, pixar style, no text, no watermark"
  );
}

/** Etapa 1 (doar pentru mod TEXT): genereaza imaginea de referinta. */
export async function startImageGeneration(englishPrompt: string) {
  return getReplicate().predictions.create({
    model: IMAGE_MODEL,
    input: {
      prompt: buildImagePrompt(englishPrompt),
      aspect_ratio: "1:1",
      output_format: "png",
      safety_tolerance: 1, // cel mai strict, platforma este pentru copii
      prompt_upsampling: false,
    },
  });
}

/** Etapa 2: transforma imaginea in mesh GLB. */
export async function startModelGeneration(imageUrl: string) {
  return getReplicate().predictions.create({
    version: MODEL_3D_VERSION,
    input: {
      images: [imageUrl],
      generate_model: true,
      generate_color: true,
      save_gaussian_ply: false,
      texture_size: 1024,
      randomize_seed: true,
    },
  });
}

export async function getPrediction(id: string) {
  return getReplicate().predictions.get(id);
}

/** Trellis returneaza un obiect cu mai multe fisiere; noua ne trebuie GLB-ul. */
export function extractModelUrl(output: unknown): string | null {
  if (!output) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output)) {
    const glb = output.find((item) => typeof item === "string" && item.includes(".glb"));
    return (glb as string) ?? (typeof output[0] === "string" ? output[0] : null);
  }
  const obj = output as Record<string, unknown>;
  const candidate = obj.model_file ?? obj.glb ?? obj.mesh;
  return typeof candidate === "string" ? candidate : null;
}

export function extractImageUrl(output: unknown): string | null {
  if (!output) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  const obj = output as Record<string, unknown>;
  return typeof obj.image === "string" ? obj.image : null;
}
