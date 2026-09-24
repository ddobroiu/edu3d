/**
 * Datele operatorului, intr-un singur loc: apar in subsol, in termeni, in
 * politica de confidentialitate si pe facturi.
 *
 * ATENTIE: adresa sediului social si telefonul trebuie completate inainte de
 * lansare. Legea 365/2002 si OUG 34/2014 cer ca un magazin online sa afiseze
 * denumirea, sediul, CUI, numarul din registrul comertului si datele de
 * contact. Campurile lasate goale nu se afiseaza, ca sa nu publicam informatii
 * inventate.
 */
export const COMPANY = {
  name: "CULOAREA DIN VIATA SA SRL",
  brand: "EDU3D",
  cui: "44820819",
  regCom: "J2021001108100",
  /** De completat: strada, numar, localitate, judet. */
  address: "",
  email: "contact@edu3d.ro",
  /** De completat, daca exista suport telefonic. */
  phone: "",
  /** Platforma europeana de solutionare online a litigiilor. */
  odrUrl: "https://ec.europa.eu/consumers/odr",
  anpcUrl: "https://anpc.ro",
} as const;

/** Randul scurt din subsol. */
export function companyLine() {
  return [COMPANY.name, `CUI ${COMPANY.cui}`, COMPANY.regCom].join(" · ");
}
