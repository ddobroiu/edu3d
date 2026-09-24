/**
 * Profilurile de copil se identifica prin initiale pe fundal colorat.
 * Cheia salvata in baza de date selecteaza culoarea.
 */
export const AVATAR_COLORS: Record<string, string> = {
  albastru: "#4f46e5",
  petrol: "#0f766e",
  visiniu: "#9f1239",
  verde: "#15803d",
  prun: "#7e22ce",
  ocru: "#b45309",
  grafit: "#334155",
  caramiziu: "#c2410c",
};

export const DEFAULT_AVATAR = "albastru";

export function avatarColor(key?: string | null) {
  return AVATAR_COLORS[key ?? ""] ?? AVATAR_COLORS[DEFAULT_AVATAR];
}

/** Maximum doua initiale, din prenume si, daca exista, din al doilea cuvant. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
