/**
 * Paginile dedicate, construite in jurul unei intentii de cautare concrete.
 *
 * Fiecare raspunde la o intrebare pe care cineva o tasteaza deja, apoi duce
 * catre actiunea potrivita din platforma. Continutul sta aici, iar randarea
 * intr-o singura pagina, ca sa nu duplicam structura de cinci ori.
 */

export type LandingPage = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  lead: string;
  /** Butonul principal. */
  cta: { href: string; label: string };
  sections: { heading: string; body: string; items?: string[] }[];
  faq: { q: string; a: string }[];
  /** Ghiduri legate, pentru navigare interna. */
  guides: string[];
};

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "modele-3d-din-text",
    title: "Creare modele 3D din text",
    h1: "Scrie o descriere, primești un model 3D",
    description:
      "Transformă o descriere scrisă în română într-un model 3D, în două minute. Fără programe de instalat și fără cunoștințe de modelare.",
    keywords: [
      "model 3D din text",
      "generare modele 3D",
      "text to 3D romana",
      "creare model 3D online",
      "modelare 3D fara program",
    ],
    lead: "Scrii ce vrei să vezi, în română. Textul este tradus automat, transformat într-o imagine de referință și apoi în geometrie tridimensională. Rezultatul se rotește pe ecran, se așază în camera ta prin realitate augmentată și se descarcă în format GLB.",
    cta: { href: "/creeaza", label: "Încearcă acum" },
    sections: [
      {
        heading: "Cum funcționează",
        body: "Procesul are două etape, iar tu nu trebuie să faci nimic între ele. Prima construiește o imagine a obiectului descris, a doua o transformă în volum.",
        items: [
          "Scrii descrierea în română, până în 300 de caractere.",
          "Textul trece printr-un filtru automat, pentru că platforma este folosită de copii.",
          "Se generează o imagine de referință a obiectului.",
          "Imaginea devine model tridimensional, cu textură.",
        ],
      },
      {
        heading: "Ce descriere dă rezultate bune",
        body: "Regula este simplă: obiect, culoare, detaliu de formă. Descrierile abstracte produc rezultate generice.",
        items: [
          "„un dragon” — prea vag, iese ceva neutru",
          "„un dragon verde cu aripi mari și solzi” — rezultat recognoscibil",
          "Un singur obiect, nu o scenă cu mai multe elemente",
          "Fără text sau litere pe obiect, ies aproape întotdeauna prost",
        ],
      },
      {
        heading: "Ce faci cu modelul",
        body: "Rămâne în contul tău și poate fi folosit oricând. Îl rotești pe ecran, îl deschizi în realitate augmentată de pe telefon, intri lângă el cu o cască VR sau îl descarci ca fișier GLB pentru alte programe și pentru imprimare 3D.",
      },
    ],
    faq: [
      {
        q: "Trebuie să știu engleză?",
        a: "Nu. Scrii în română, iar traducerea se face automat înainte de generare.",
      },
      {
        q: "Cât durează?",
        a: "Între unu și trei minute. Poți închide pagina, lucrarea continuă și o găsești în cont.",
      },
      {
        q: "Cât costă?",
        a: "10 credite o creație din text. La înregistrare primești 10 credite, fără card.",
      },
      {
        q: "Modelul îmi aparține?",
        a: "Da. Îl poți descărca și folosi liber, inclusiv pentru imprimare 3D.",
      },
    ],
    guides: ["idei-de-modele-3d-pentru-copii", "ce-este-fisierul-glb"],
  },

  {
    slug: "modele-3d-din-poza",
    title: "Transformă o poză în model 3D",
    h1: "Din fotografie în model 3D",
    description:
      "Încarcă o fotografie și primești un model tridimensional. Ce poze funcționează, ce nu, și cum arăți rezultatul în realitate augmentată.",
    keywords: [
      "poza in model 3D",
      "fotografie in 3D",
      "scanare 3D cu telefonul",
      "imagine in model 3D",
      "conversie poza 3D",
    ],
    lead: "O fotografie conține o singură perspectivă. Modelul completează restul volumului pornind de la ce vede. Funcționează surprinzător de bine pe obiecte simple, fotografiate corect.",
    cta: { href: "/creeaza", label: "Încarcă o fotografie" },
    sections: [
      {
        heading: "Ce fotografie funcționează",
        body: "Rata de reușită depinde aproape în întregime de fotografie, nu de obiect.",
        items: [
          "Un singur obiect în cadru, întreg, netăiat de margine",
          "Fundal simplu și contrastant, ideal o coală albă",
          "Lumină uniformă, fără bliț și fără umbre dure",
          "Fotografiere din față, ușor de sus",
        ],
      },
      {
        heading: "Ce nu funcționează",
        body: "Unele materiale și forme sunt imposibil de reconstruit dintr-o singură imagine.",
        items: [
          "Sticlă, crom și suprafețe foarte lucioase",
          "Obiecte foarte subțiri: foi, sârme, fire",
          "Blană, păr sau frunziș dens",
          "Mai multe obiecte suprapuse",
        ],
      },
      {
        heading: "Limitele de care merită să știi",
        body: "Partea din spate a obiectului nu a fost niciodată fotografiată, deci este o presupunere plauzibilă, nu o măsurătoare. Pentru teme școlare, prezentări sau joacă, rezultatul este mai mult decât suficient. Pentru o piesă tehnică la milimetru, nu.",
      },
    ],
    faq: [
      {
        q: "De câte fotografii am nevoie?",
        a: "Una singură. Mai multe poze ale aceluiași obiect nu îmbunătățesc rezultatul în acest tip de conversie.",
      },
      {
        q: "Ce formate acceptați?",
        a: "JPG, PNG și WEBP, până la 8 MB.",
      },
      {
        q: "Pot încărca o poză cu o persoană?",
        a: "Tehnic da, dar nu recomandăm. Fotografiile cu persoane, mai ales cu copii, nu ar trebui încărcate fără acordul explicit al celor din imagine.",
      },
      {
        q: "Cât costă?",
        a: "12 credite o creație din fotografie, cu două credite mai mult decât din text, pentru că procesul este mai costisitor.",
      },
    ],
    guides: ["cum-transformi-o-poza-in-model-3d", "ar-pe-iphone-si-android"],
  },

  {
    slug: "modele-3d-gratuite",
    title: "Bibliotecă de modele 3D",
    h1: "Peste un milion de modele 3D, într-un singur loc",
    description:
      "Caută în română într-o bibliotecă de peste un milion de modele 3D, cu licențe verificate. Le vezi în 3D și în realitate augmentată, direct în browser.",
    keywords: [
      "modele 3D gratuite",
      "biblioteca modele 3D",
      "modele GLB gratuite",
      "descarca modele 3D",
      "modele 3D licenta libera",
    ],
    lead: "Căutarea funcționează în română: scrii „dinozaur” și primești dinozauri. Modelele se deschid în vizualizatorul platformei, cu realitate augmentată, nu într-un player extern.",
    cta: { href: "/modele", label: "Caută în bibliotecă" },
    sections: [
      {
        heading: "Doar licențe care permit reutilizarea",
        body: "Biblioteca este filtrată la trei licențe, singurele sub care un model poate fi găzduit și folosit într-un produs comercial. Numele autorului și licența sunt afișate pe pagina fiecărui model.",
        items: [
          "CC0 — domeniu public, fără nicio obligație",
          "CC-BY — utilizare liberă, cu menționarea autorului",
          "CC-BY-SA — la fel, iar modificările se distribuie în aceleași condiții",
          "Sunt excluse licențele care interzic uzul comercial sau modificările",
        ],
      },
      {
        heading: "Nu doar de privit",
        body: "Un model deschis ajunge în platformă și se afișează în același vizualizator ca modelele create de tine: rotire, realitate augmentată pe telefon, mod VR pe cască. Fișierul rămâne disponibil și pentru descărcare.",
      },
      {
        heading: "Filtrate ca să funcționeze",
        body: "Modelele prea mari pentru a fi încărcate în browser nu apar deloc în rezultate. Nu dai click pe ceva ce nu se poate deschide.",
      },
    ],
    faq: [
      {
        q: "Costă ceva?",
        a: "Prima deschidere a unui model costă 2 credite. După aceea îl poți revedea oricând, gratuit.",
      },
      {
        q: "Pot să le imprim 3D?",
        a: "Da, dacă licența permite. CC0 și CC-BY permit, inclusiv comercial. Modelul trebuie pregătit înainte, ca orice fișier de imprimat.",
      },
      {
        q: "Pot căuta în română?",
        a: "Da. Interogarea este tradusă automat, pentru că biblioteca este indexată în engleză.",
      },
    ],
    guides: ["modele-3d-pentru-imprimanta-3d", "ce-este-fisierul-glb"],
  },
];

export function getLandingPage(slug: string) {
  return LANDING_PAGES.find((page) => page.slug === slug);
}
