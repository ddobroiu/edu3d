/**
 * Filtru simplu pentru textul scris de copii. Nu inlocuieste moderarea
 * furnizorului (Flux ruleaza oricum cu safety_tolerance 1), dar opreste
 * cererile evident nepotrivite inainte sa consume credite.
 */

const BLOCKED = [
  // violenta / arme
  "arma", "arme", "pistol", "pusca", "cutit", "sange", "sangeros", "omor", "ucide", "mort",
  "bomba", "glont", "razboi", "tortura", "gun", "weapon", "knife", "blood", "kill", "murder",
  "corpse", "gore", "bomb", "war",
  // continut sexual
  "sex", "sexy", "nud", "nuda", "gol", "goala", "porno", "pornografic", "erotic",
  "nude", "naked", "porn", "nsfw", "lingerie",
  // droguri / substante
  "drog", "droguri", "cocaina", "heroina", "tigara", "tigari", "alcool", "bere", "vodka",
  "drug", "cocaine", "heroin", "cigarette", "alcohol", "beer", "whiskey",
  // ura
  "nazi", "hitler", "swastica", "swastika", "terorist", "terrorist", "isis",
  // date personale
  "cnp", "parola", "password", "card bancar",
];

/** Litere cu diacritice -> fara diacritice, ca sa nu treaca "cuțit" de filtru. */
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type ModerationResult = { ok: true } | { ok: false; reason: string };

export function checkPrompt(prompt: string): ModerationResult {
  const text = prompt.trim();

  if (text.length < 2) {
    return { ok: false, reason: "Scrie putin mai mult, ca sa stim ce sa cream!" };
  }
  if (text.length > 300) {
    return { ok: false, reason: "Descrierea este prea lunga. Incearca in maximum 300 de caractere." };
  }

  const normalized = normalize(text);
  const words = new Set(normalized.split(" "));

  for (const term of BLOCKED) {
    const hit = term.includes(" ") ? normalized.includes(term) : words.has(term);
    if (hit) {
      return {
        ok: false,
        reason: "Hai sa alegem altceva! Incearca un animal, o planeta, o masina sau o cladire.",
      };
    }
  }

  return { ok: true };
}
