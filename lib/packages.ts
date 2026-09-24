import { GENERATION_COST_TEXT } from "./pricing";

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  bonus: number;
  price: number; // RON, cu TVA inclus
  audience: "family" | "school";
  popular?: boolean;
  perks: string[];
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "descoperitor",
    name: "Descoperitor",
    credits: 50,
    bonus: 0,
    price: 29,
    audience: "family",
    perks: ["5 creatii 3D", "Acces la toate lectiile", "Vizualizare 3D si VR", "Galerie privata"],
  },
  {
    id: "explorator",
    name: "Explorator",
    credits: 200,
    bonus: 20,
    price: 89,
    audience: "family",
    popular: true,
    perks: [
      "22 de creatii 3D",
      "20 de credite bonus",
      "Pana la 4 profile de copil",
      "Descarcare fisiere GLB",
    ],
  },
  {
    id: "clasa",
    name: "Clasa",
    credits: 750,
    bonus: 150,
    price: 279,
    audience: "school",
    perks: [
      "90 de creatii 3D",
      "150 de credite bonus",
      "Buget de credite pentru clasa",
      "Elevi nelimitati intr-o clasa",
      "Factura pe scoala",
    ],
  },
];

export function getPackage(id: string) {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id);
}

export function totalCredits(pkg: CreditPackage) {
  return pkg.credits + pkg.bonus;
}

/** Cate modele iese dintr-un pachet -- folosit in textele de pe pagina de preturi. */
export function modelCount(pkg: CreditPackage) {
  return Math.floor(totalCredits(pkg) / GENERATION_COST_TEXT);
}
