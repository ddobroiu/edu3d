/**
 * Aceleasi ecrane sunt folosite de parinti si de cadre didactice, dar nu si
 * aceleasi cuvinte: un parinte are copii, un profesor are elevi. Textele care
 * difera intre cele doua contexte stau aici, intr-un singur loc.
 */
export function isTeacher(role?: string | null) {
  return role === "TEACHER" || role === "ADMIN";
}

export function words(role?: string | null) {
  const teacher = isTeacher(role);

  return {
    teacher,
    /** "copil" / "elev" */
    child: teacher ? "elev" : "copil",
    childCapitalized: teacher ? "Elev" : "Copil",
    /** "copii" / "elevi" */
    children: teacher ? "elevi" : "copii",
    /** Titlul listei de profiluri. */
    profilesTitle: teacher ? "Elevii mei" : "Copiii mei",
    profilesHint: teacher
      ? "Fiecare elev are lucrarile proprii. Creditele raman in contul tau."
      : "Fiecare copil are creatiile lui. Creditele raman in contul tau.",
    nameLabel: teacher ? "Numele elevului" : "Numele copilului",
    addProfile: teacher ? "Adauga elev" : "Adauga copil",
    /** Cum numim rezultatul unei generari. */
    creation: teacher ? "lucrare" : "creatie",
    creations: teacher ? "lucrari" : "creatii",
    creationsTitle: teacher ? "Lucrari recente" : "Creatii recente",
    profilesCount: teacher ? "elevi" : "copii",
    whoCreates: teacher ? "Cine lucreaza?" : "Cine creeaza?",
    noProfiles: teacher
      ? "Niciun elev disponibil in acest context."
      : "Niciun copil adaugat inca.",
    deleteConfirm: (name: string) =>
      teacher
        ? `Stergi profilul lui ${name}? Lucrarile raman in contul tau.`
        : `Stergi profilul lui ${name}? Creatiile raman in contul tau.`,
    dashboardIntro: teacher
      ? "Elevii, creditele si lucrarile clasei."
      : "Copiii, creditele si tot ce au creat.",
  };
}

export type Words = ReturnType<typeof words>;
