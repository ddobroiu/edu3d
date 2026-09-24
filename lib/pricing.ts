/**
 * Preturile in credite. Fisierul nu importa nimic: este folosit si pe server,
 * si in componentele de browser, iar `lib/credits.ts` trage Prisma dupa el.
 */

/** Creatie 3D pornind de la un text. */
export const GENERATION_COST_TEXT = 10;

/** Creatie 3D pornind de la o fotografie: proces mai scump. */
export const GENERATION_COST_IMAGE = 12;

/**
 * Deschiderea unui model din biblioteca. Se plateste o singura data de fiecare
 * utilizator pentru fiecare model: la redeschidere nu se mai retine nimic.
 */
export const LIBRARY_OPEN_COST = 2;

/** Credite primite la crearea contului. */
export const WELCOME_CREDITS = 10;

export function generationCost(mode: "TEXT" | "IMAGE") {
  return mode === "IMAGE" ? GENERATION_COST_IMAGE : GENERATION_COST_TEXT;
}
