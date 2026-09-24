/**
 * Ghidurile publicate pe edu3d.
 *
 * Textele sunt scrise cu diacritice, spre deosebire de interfata: sunt
 * continut de citit, evaluat si de cititori, si de motoarele de cautare.
 * Fiecare ghid raspunde la o intrebare concreta si se leaga de ce face
 * platforma, fara sa fie reclama deghizata.
 */

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string };

export type Article = {
  slug: string;
  title: string;
  /** Meta description: sub 160 de caractere. */
  description: string;
  keywords: string[];
  published: string;
  updated: string;
  readingMinutes: number;
  intro: string;
  blocks: ArticleBlock[];
  faq: { q: string; a: string }[];
  related: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "cum-transformi-o-poza-in-model-3d",
    title: "Cum transformi o poză într-un model 3D",
    description:
      "Ghid pas cu pas: ce fotografie funcționează, cum se face conversia în 3D și ce poți face cu modelul rezultat.",
    keywords: [
      "poza in model 3D",
      "cum transform o poza in 3D",
      "fotografie in model 3D",
      "model 3D din imagine",
      "scanare 3D cu telefonul",
    ],
    published: "2026-09-04",
    updated: "2026-09-04",
    readingMinutes: 6,
    intro:
      "Transformarea unei fotografii într-un model tridimensional nu mai cere scaner sau cunoștințe de modelare. Iată cum funcționează, ce fotografii dau rezultate bune și unde se împotmolesc majoritatea încercărilor.",
    blocks: [
      { type: "h2", text: "Ce se întâmplă, de fapt" },
      {
        type: "p",
        text: "O fotografie este plată: conține o singură perspectivă. Un model 3D are volum, adică și partea pe care camera nu a văzut-o niciodată. Diferența dintre ele este completată de un model antrenat pe milioane de obiecte, care „ghicește” forma din spate pornind de la ce vede în față.",
      },
      {
        type: "p",
        text: "De aici vine și principala limitare: spatele obiectului este o presupunere plauzibilă, nu o măsurătoare. Pentru teme școlare, prezentări sau joacă, rezultatul este mai mult decât suficient. Pentru o piesă tehnică la milimetru, nu.",
      },
      { type: "h2", text: "Ce fotografie dă rezultate bune" },
      {
        type: "ul",
        items: [
          "Un singur obiect în cadru. Două jucării alăturate devin, de obicei, o singură formă confuză.",
          "Obiectul întreg, nu tăiat de marginea pozei. Ce lipsește din fotografie va lipsi și din model.",
          "Fundal simplu și contrastant. O jucărie închisă la culoare pe o masă închisă la culoare este cel mai frecvent motiv de eșec.",
          "Lumină uniformă. Umbrele puternice sunt interpretate ca adâncituri reale în obiect.",
          "Fotografiere din față, ușor de sus. Unghiul acesta arată cele mai multe suprafețe deodată.",
        ],
      },
      {
        type: "note",
        text: "Un truc care schimbă totul: pune obiectul pe o coală albă A4, lângă o fereastră, fără bliț. Rata de reușită crește vizibil.",
      },
      { type: "h2", text: "Ce nu funcționează" },
      {
        type: "ul",
        items: [
          "Suprafețe transparente sau foarte lucioase — sticla și cromul reflectă camera, nu forma proprie.",
          "Obiecte foarte subțiri, ca o foaie sau o sârmă: nu au volum de reconstruit.",
          "Blană, păr, frunziș dens — ies ca o masă compactă.",
          "Fotografii cu mai multe obiecte suprapuse.",
        ],
      },
      { type: "h2", text: "Pașii concreți" },
      {
        type: "ol",
        items: [
          "Fotografiază obiectul respectând regulile de mai sus, sau alege o poză existentă.",
          "Încarcă fotografia în atelier. Formatele acceptate sunt JPG, PNG și WEBP, până la 8 MB.",
          "Așteaptă procesarea. Durează, de regulă, între unu și trei minute.",
          "Verifică rezultatul rotindu-l. Dacă spatele arată ciudat, refotografiază din alt unghi.",
        ],
      },
      { type: "h2", text: "Ce faci cu modelul după" },
      {
        type: "p",
        text: "Modelul rezultat este un fișier GLB, formatul standard pentru web și realitate augmentată. Îl poți roti pe ecran, îl poți așeza în camera ta prin camera telefonului sau îl poți descărca pentru a-l folosi în alt program.",
      },
      {
        type: "p",
        text: "Pentru imprimare 3D, GLB-ul trebuie convertit în STL — majoritatea programelor de feliere acceptă direct GLB sau îl importă printr-un pas intermediar.",
      },
    ],
    faq: [
      {
        q: "Câte fotografii îmi trebuie?",
        a: "Una singură este suficientă. Mai multe fotografii ale aceluiași obiect nu îmbunătățesc rezultatul în acest tip de conversie.",
      },
      {
        q: "Pot folosi o poză cu o persoană?",
        a: "Tehnic da, dar nu recomandăm. Fotografiile cu persoane, mai ales cu copii, nu ar trebui încărcate fără acordul explicit al celor din imagine.",
      },
      {
        q: "Cât durează?",
        a: "Între unu și trei minute în mod obișnuit. Dacă închizi pagina, procesarea continuă și găsești modelul în cont.",
      },
    ],
    related: ["ce-este-fisierul-glb", "modele-3d-pentru-imprimanta-3d"],
  },

  {
    slug: "realitate-augmentata-la-clasa",
    title: "Realitate augmentată la clasă, fără echipamente scumpe",
    description:
      "Cum folosești AR la oră cu telefoanele care există deja în clasă: ce îți trebuie, ce merge și ce nu, plus trei scenarii concrete.",
    keywords: [
      "realitate augmentata in educatie",
      "AR la clasa",
      "lectii cu realitate augmentata",
      "tehnologie in scoala",
      "material didactic digital",
    ],
    published: "2026-09-04",
    updated: "2026-09-04",
    readingMinutes: 7,
    intro:
      "Realitatea augmentată a ajuns la clasă înaintea bugetelor pentru ea. Vestea bună este că nu ai nevoie de ochelari, licențe sau laborator: telefoanele din buzunarele elevilor fac deja treaba.",
    blocks: [
      { type: "h2", text: "AR și VR nu sunt același lucru" },
      {
        type: "p",
        text: "Confuzia este atât de răspândită încât merită lămurită din start. În realitatea augmentată, obiectul virtual apare peste imaginea reală, prin camera telefonului: inima omului stă pe bancă, lângă penar. În realitatea virtuală, elevul intră cu totul într-o scenă, cu o cască pe cap.",
      },
      {
        type: "p",
        text: "Pentru școală, AR este alegerea practică. Nu izolează elevul de clasă, nu provoacă rău de mișcare, nu cere echipament și se poate face în doi și în treizeci, simultan.",
      },
      { type: "h2", text: "Ce îți trebuie, concret" },
      {
        type: "ul",
        items: [
          "Un telefon sau o tabletă din ultimii cinci-șase ani. Aproape orice model Android sau iPhone recent suportă AR nativ.",
          "Conexiune la internet pentru încărcarea modelului.",
          "Spațiu liber pe podea sau pe o bancă, cât o coală A3.",
          "Atât. Fără aplicații de instalat, dacă modelul se deschide din browser.",
        ],
      },
      {
        type: "note",
        text: "Dacă în clasă există un singur telefon, proiectează ecranul lui. Efectul „obiectul e chiar aici, pe catedră” funcționează și văzut de la distanță.",
      },
      { type: "h2", text: "Trei scenarii care funcționează" },
      { type: "h3", text: "1. Scara reală" },
      {
        type: "p",
        text: "Cea mai puternică utilizare a AR nu e spectacolul, ci scara. Un elev care vede un Tyrannosaurus la mărimea lui reală, ocupând jumătate din sala de clasă, înțelege altfel decât dintr-o poză din manual. La fel funcționează cu o balenă, o rachetă sau un mamut.",
      },
      { type: "h3", text: "2. Interiorul lucrurilor" },
      {
        type: "p",
        text: "O inimă, o celulă sau un motor pot fi rotite și privite din unghiuri imposibile în realitate. Elevul controlează perspectiva, ceea ce schimbă rolul din spectator în explorator.",
      },
      { type: "h3", text: "3. Obiectul creat de ei" },
      {
        type: "p",
        text: "Cel mai eficient exercițiu nu e să le arăți un model, ci să îl facă ei. Un elev care descrie în scris ce vrea să vadă și apoi își rotește propriul obiect a trecut prin formulare, verificare și corectare — adică prin exact ce vrei să exersezi.",
      },
      { type: "h2", text: "Unde se împiedică lucrurile" },
      {
        type: "ul",
        items: [
          "Camera cere lumină. Într-o sală întunecoasă, urmărirea suprafeței eșuează.",
          "Suprafețele uniforme, ca o masă complet albă, sunt greu de „prins”. O foaie cu text pe ea rezolvă problema.",
          "Modelele mari se încarcă greu pe rețeaua școlii. Pregătește-le acasă, în aceeași zi.",
          "Pe iPhone, AR are nevoie de un format aparte, USDZ. Verifică înainte de oră că modelul se deschide pe telefonul tău.",
        ],
      },
      { type: "h2", text: "Cum arată o oră reală" },
      {
        type: "ol",
        items: [
          "Cinci minute: arăți obiectul pe proiector și pui o întrebare la care poza din manual nu răspunde.",
          "Zece minute: elevii îl deschid pe telefon și îl așază pe bancă. Îi pui să observe ceva anume, nu doar să se uite.",
          "Cincisprezece minute: fiecare descrie în scris obiectul pe care ar vrea să îl vadă și îl creează.",
          "Restul orei: comparați rezultatele și discutați de ce unele descrieri au ieșit mai bine decât altele.",
        ],
      },
    ],
    faq: [
      {
        q: "Elevii au nevoie de cont?",
        a: "Nu. Într-o clasă, cadrul didactic administrează contul și profilurile, iar elevii lucrează sub ele. Copiii nu își fac conturi proprii.",
      },
      {
        q: "Funcționează pe tabletele școlii?",
        a: "Dacă sunt din ultimii ani și au camera funcțională, da. Modelele se rotesc pe ecran chiar și pe dispozitivele fără suport AR.",
      },
      {
        q: "Am nevoie de internet la fiecare oră?",
        a: "Pentru încărcarea modelului, da. După ce s-a încărcat în pagină, rotirea și AR-ul funcționează local.",
      },
    ],
    related: ["cum-transformi-o-poza-in-model-3d", "sistemul-solar-cu-modele-3d"],
  },

  {
    slug: "ce-este-fisierul-glb",
    title: "Ce este un fișier GLB și cum îl deschizi",
    description:
      "GLB explicat simplu: ce conține, cu ce diferă de GLTF, OBJ și STL, și cum îl deschizi pe Windows, Mac sau telefon.",
    keywords: [
      "ce este GLB",
      "fisier GLB",
      "cum deschid GLB",
      "GLB vs GLTF",
      "GLB in STL",
      "format model 3D",
    ],
    published: "2026-09-04",
    updated: "2026-09-04",
    readingMinutes: 5,
    intro:
      "Dacă ai descărcat un model 3D și ai rămas cu un fișier .glb pe care nu îl deschide nimic, articolul acesta rezolvă problema în două minute.",
    blocks: [
      { type: "h2", text: "Ce conține un GLB" },
      {
        type: "p",
        text: "GLB este un singur fișier care ține tot ce înseamnă un model 3D: geometria (forma), texturile (culorile și materialele), scheletul și animațiile, dacă există. Este varianta „împachetată” a formatului GLTF, motiv pentru care i se mai spune și „JPEG-ul lumii 3D”.",
      },
      {
        type: "p",
        text: "Avantajul practic e simplu: un singur fișier de mutat. Nu ai un folder cu texturi care se pierd pe drum.",
      },
      { type: "h2", text: "GLB, GLTF, OBJ, STL: care pe ce" },
      {
        type: "ul",
        items: [
          "GLB — un fișier, cu texturi incluse. Cel mai bun pentru web, AR și partajare.",
          "GLTF — același conținut, dar despărțit în mai multe fișiere. Util când vrei să editezi texturile separat.",
          "OBJ — format vechi și foarte răspândit, dar texturile vin în fișiere separate. Fără animații.",
          "STL — doar forma, fără culoare. Formatul imprimantelor 3D.",
        ],
      },
      {
        type: "note",
        text: "Regula scurtă: GLB pentru privit, STL pentru imprimat.",
      },
      { type: "h2", text: "Cum îl deschizi" },
      { type: "h3", text: "Pe Windows" },
      {
        type: "p",
        text: "Windows 10 și 11 au inclusă aplicația Vizualizator 3D (3D Viewer). Dublu clic pe fișier este de obicei suficient. Dacă nu se deschide, instaleaz-o gratuit din Microsoft Store.",
      },
      { type: "h3", text: "Pe Mac și iPhone" },
      {
        type: "p",
        text: "macOS și iOS preferă formatul USDZ. Un GLB se deschide cel mai simplu într-un browser, pe un vizualizator web. Pentru AR pe iPhone ai nevoie de varianta USDZ a modelului.",
      },
      { type: "h3", text: "În browser, fără nimic instalat" },
      {
        type: "p",
        text: "Cea mai rapidă cale, indiferent de sistem: un vizualizator web. Tragi fișierul în pagină și îl rotești imediat. Funcționează la fel pe calculator, tabletă și telefon.",
      },
      { type: "h2", text: "Cum îl transformi în STL pentru imprimare" },
      {
        type: "ol",
        items: [
          "Deschide GLB-ul într-un program gratuit de modelare, cum este Blender.",
          "Verifică dimensiunile: modelele descărcate ajung des la câțiva centimetri sau, dimpotrivă, la zeci de metri.",
          "Exportă ca STL.",
          "Deschide STL-ul în programul de feliere al imprimantei.",
        ],
      },
      {
        type: "p",
        text: "Ține minte că STL pierde culorile. Dacă imprimanta ta este cu un singur filament, oricum nu contează.",
      },
    ],
    faq: [
      {
        q: "GLB se poate edita?",
        a: "Da, în Blender sau în orice program care importă GLTF. Îl poți redimensiona, colora sau curăța de detalii inutile.",
      },
      {
        q: "De ce e fișierul meu atât de mare?",
        a: "Aproape întotdeauna din cauza texturilor. Reducerea rezoluției texturilor de la 4096 la 1024 de pixeli scade fișierul de câteva ori, fără diferență vizibilă pe ecran.",
      },
      {
        q: "Pot pune un GLB pe site-ul meu?",
        a: "Da. Există componente web dedicate care afișează GLB direct în pagină, cu rotire și AR, fără plugin.",
      },
    ],
    related: ["modele-3d-pentru-imprimanta-3d", "cum-transformi-o-poza-in-model-3d"],
  },

  {
    slug: "modele-3d-pentru-imprimanta-3d",
    title: "Modele 3D pentru imprimantă: de unde le iei și cum le pregătești",
    description:
      "Surse de modele 3D gratuite și legale, ce licențe trebuie verificate și pașii de pregătire înainte de imprimare.",
    keywords: [
      "modele 3D pentru imprimanta",
      "modele 3D gratuite",
      "STL gratuit",
      "printare 3D modele",
      "licente modele 3D",
    ],
    published: "2026-09-04",
    updated: "2026-09-04",
    readingMinutes: 6,
    intro:
      "Ai imprimanta, ai filamentul, îți lipsește modelul. Iată de unde iei modele fără să încalci drepturi de autor și ce verifici înainte să apeși Print.",
    blocks: [
      { type: "h2", text: "Trei feluri de a obține un model" },
      {
        type: "ol",
        items: [
          "Îl descarci dintr-o bibliotecă publică. Rapid, dar trebuie citită licența.",
          "Îl generezi pornind de la o descriere sau o fotografie. Bun pentru obiecte care nu există în biblioteci.",
          "Îl modelezi singur. Control total, dar cere timp și învățare.",
        ],
      },
      { type: "h2", text: "Licențele, pe scurt" },
      {
        type: "p",
        text: "Partea pe care majoritatea o sare și care produce cele mai multe probleme. Un model „gratuit” nu înseamnă „poți face orice cu el”.",
      },
      {
        type: "ul",
        items: [
          "CC0 — domeniu public. Poți face orice, inclusiv să vinzi. Fără obligații.",
          "CC-BY — poți folosi și vinde, dar trebuie să menționezi autorul.",
          "CC-BY-SA — ca mai sus, plus obligația de a distribui modificările în aceleași condiții.",
          "CC-BY-NC — interzice orice utilizare comercială. Nu poți vinde obiectul imprimat.",
          "CC-BY-ND — interzice modificările. Redimensionarea poate intra deja în această categorie.",
        ],
      },
      {
        type: "note",
        text: "Dacă intenționezi să vinzi ce imprimi, rămâi la CC0, CC-BY și CC-BY-SA. Restul te expun juridic.",
      },
      { type: "h2", text: "Verificări înainte de imprimare" },
      {
        type: "ul",
        items: [
          "Scara. Modelele descărcate ajung frecvent la dimensiuni absurde. Verifică întotdeauna în milimetri.",
          "Grosimea pereților. Sub 1,2 mm, majoritatea imprimantelor FDM produc pereți fragili sau găuri.",
          "Suprafețele suspendate. Peste 45 de grade înclinare, ai nevoie de suporturi.",
          "Baza. O suprafață mică de contact înseamnă piesă desprinsă la jumătatea imprimării.",
          "Geometria închisă. Un model cu găuri în suprafață confuzează programul de feliere.",
        ],
      },
      { type: "h2", text: "Modelele generate sunt bune de imprimat?" },
      {
        type: "p",
        text: "Depinde de ce vrei. Pentru o figurină, un obiect decorativ sau un ajutor didactic, da — cu mențiunea că vor avea nevoie de o trecere prin Blender pentru scară și, uneori, pentru închiderea suprafeței.",
      },
      {
        type: "p",
        text: "Pentru piese funcționale, cu dimensiuni exacte și îmbinări, nu. Acolo ai nevoie de modelare parametrică, într-un program de tip CAD.",
      },
      { type: "h2", text: "Pașii de pregătire" },
      {
        type: "ol",
        items: [
          "Deschide modelul în Blender și pune-l cu baza pe planul zero.",
          "Setează dimensiunea reală dorită, în milimetri.",
          "Verifică suprafața cu instrumentul 3D Print Toolbox, inclus în Blender.",
          "Exportă în STL.",
          "În programul de feliere, alege orientarea care cere cele mai puține suporturi.",
        ],
      },
    ],
    faq: [
      {
        q: "Pot vinde obiecte imprimate după modele descărcate?",
        a: "Doar dacă licența permite. CC0 și CC-BY permit, cu atribuire în cazul CC-BY. Licențele NC interzic explicit acest lucru.",
      },
      {
        q: "De ce iese modelul minuscul?",
        a: "Unitățile diferă între programe. Un model exportat în metri devine milimetri la import, deci de o mie de ori mai mic. Setează scara manual.",
      },
      {
        q: "Ce fac cu un model cu suprafața spartă?",
        a: "Blender are o funcție de reparare în 3D Print Toolbox. Pentru cazuri grele, există și servicii web de reparare automată.",
      },
    ],
    related: ["ce-este-fisierul-glb", "cum-transformi-o-poza-in-model-3d"],
  },

  {
    slug: "sistemul-solar-cu-modele-3d",
    title: "Cum explici sistemul solar cu modele 3D",
    description:
      "De ce planșa cu planete nu funcționează, ce înțeleg copiii greșit despre sistemul solar și cum corectezi asta cu modele tridimensionale.",
    keywords: [
      "sistemul solar pentru copii",
      "planete model 3D",
      "lectie astronomie scoala",
      "material didactic astronomie",
      "sistemul solar la scara",
    ],
    published: "2026-09-04",
    updated: "2026-09-04",
    readingMinutes: 6,
    intro:
      "Aproape toți copiii pot enumera planetele. Aproape niciunul nu are o idee corectă despre cât de goală este de fapt distanța dintre ele. Diferența vine din materialul folosit.",
    blocks: [
      { type: "h2", text: "Ce înțeleg copiii greșit" },
      {
        type: "p",
        text: "Planșa clasică cu sistemul solar are o problemă de fond: pune planetele una lângă alta, la dimensiuni comparabile, pentru că altfel nu ar încăpea pe hârtie. Copilul reține exact această imagine — un șir de bile apropiate, de mărimi asemănătoare.",
      },
      {
        type: "p",
        text: "Realitatea e alta. Dacă Soarele ar avea dimensiunea unei mingi de fotbal, Pământul ar fi o bilă de 2 milimetri, aflată la 25 de metri distanță. Neptun ar fi la aproape un kilometru.",
      },
      { type: "h2", text: "Două lucruri deodată nu se pot arăta" },
      {
        type: "p",
        text: "Este imposibil să arăți simultan, corect, și mărimile, și distanțele. Orice material care pretinde că o face minte la una dintre ele. Soluția didactică este să le desparți în două activități.",
      },
      { type: "h3", text: "Activitatea 1: mărimile" },
      {
        type: "p",
        text: "Așază planetele una lângă alta, la scară corectă de mărime, ignorând distanțele. Aici modelele 3D ajută concret: un elev care rotește Saturn cu inelele lui și îl compară cu Pământul înțelege raportul altfel decât din două cercuri desenate.",
      },
      { type: "h3", text: "Activitatea 2: distanțele" },
      {
        type: "p",
        text: "Ieși pe hol sau în curte cu o ruletă și un ghem de sfoară. Pune Soarele la un capăt și mergi până la fiecare planetă. Momentul în care clasa realizează că trebuie să iasă din clădire pentru Neptun valorează cât o oră de explicații.",
      },
      { type: "h2", text: "Ce merită arătat în 3D, concret" },
      {
        type: "ul",
        items: [
          "Saturn — inelele sunt de departe cel mai convingător argument pentru rotirea unui model.",
          "Pământul și Luna, împreună — raportul de mărime surprinde aproape pe toată lumea.",
          "Marte, cu Valles Marineris — un canion de patru mii de kilometri se vede doar rotind planeta.",
          "Jupiter, cu Pata Roșie — o furtună în care încap două planete ca a noastră.",
          "O rachetă sau o stație orbitală — leagă astronomia de ceva construit de oameni.",
        ],
      },
      {
        type: "note",
        text: "Dacă folosești realitate augmentată, așază planeta pe podeaua clasei, nu pe bancă. Are nevoie de spațiu ca să impresioneze.",
      },
      { type: "h2", text: "Întrebări care declanșează discuția" },
      {
        type: "ul",
        items: [
          "Dacă Soarele s-ar stinge acum, în cât timp am afla? (Opt minute și douăzeci de secunde.)",
          "De ce Venus este mai fierbinte decât Mercur, deși e mai departe de Soare?",
          "De ce vedem mereu aceeași față a Lunii?",
          "Câte planete au inele? (Toate cele patru gigante, nu doar Saturn.)",
        ],
      },
      { type: "h2", text: "Legătura cu scrisul" },
      {
        type: "p",
        text: "Cel mai util exercițiu combinat: pune elevii să descrie în scris, cât mai exact, planeta pe care vor să o vadă. „O planetă” dă un rezultat vag. „O planetă portocalie cu inele subțiri și multe cratere” dă altceva. Copilul învață, fără să i se predea, că precizia în exprimare schimbă rezultatul.",
      },
    ],
    faq: [
      {
        q: "De la ce vârstă funcționează?",
        a: "Activitatea cu mărimile merge de la 7-8 ani. Cea cu distanțele, care cere raționament proporțional, prinde mai bine de la 10 ani în sus.",
      },
      {
        q: "Am nevoie de echipament special?",
        a: "Nu. Un proiector și, opțional, câteva telefoane pentru partea de realitate augmentată.",
      },
      {
        q: "Cât durează activitatea completă?",
        a: "Două ore, ideal despărțite: mărimile într-o oră, distanțele în alta, cu ieșire din clasă.",
      },
    ],
    related: ["realitate-augmentata-la-clasa", "cum-transformi-o-poza-in-model-3d"],
  },

  {
    slug: "ar-pe-iphone-si-android",
    title: "AR pe iPhone și Android: de ce merge diferit",
    description:
      "Quick Look, Scene Viewer și WebXR explicate simplu. De ce un model se deschide pe Android și nu pe iPhone, și cum rezolvi.",
    keywords: [
      "AR pe iPhone",
      "realitate augmentata Android",
      "USDZ",
      "Scene Viewer",
      "WebXR",
      "de ce nu merge AR",
    ],
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 5,
    intro:
      "Ai trimis un model 3D unui coleg, la tine s-a deschis în cameră și la el nu. Nu e vina lui: cele două sisteme folosesc mecanisme complet diferite pentru realitate augmentată.",
    blocks: [
      { type: "h2", text: "Trei mecanisme, nu unul" },
      {
        type: "ul",
        items: [
          "Quick Look — mecanismul Apple. Funcționează doar cu fișiere USDZ. Este integrat în sistem, deci nu cere nicio aplicație.",
          "Scene Viewer — mecanismul Google, pe Android. Folosește fișiere GLB și are nevoie de serviciile Google Play pentru AR.",
          "WebXR — standardul deschis, care rulează direct în browser. Suportul este bun pe Android și încă limitat pe iOS.",
        ],
      },
      {
        type: "note",
        text: "Concluzia practică: un model publicat corect are nevoie de două fișiere, un GLB și un USDZ. Cu unul singur, jumătate din utilizatori rămân pe dinafară.",
      },
      { type: "h2", text: "De ce nu se deschide pe iPhone" },
      {
        type: "p",
        text: "În aproape toate cazurile, pentru că pagina oferă doar GLB. iPhone-ul nu știe ce să facă cu el în modul AR, deși îl afișează perfect pe ecran, rotit cu degetul. Diferența apare exact la apăsarea butonului de realitate augmentată.",
      },
      {
        type: "p",
        text: "Soluția este ca platforma să pregătească și varianta USDZ. Când există, butonul de AR pornește Quick Look și obiectul apare în cameră, la scară reală, fără nicio instalare.",
      },
      { type: "h2", text: "De ce nu se deschide pe Android" },
      {
        type: "ul",
        items: [
          "Telefonul nu este în lista de dispozitive compatibile cu ARCore. Modelele foarte ieftine sau vechi lipsesc.",
          "Serviciile Google Play pentru AR nu sunt instalate sau sunt dezactivate.",
          "Browserul nu este Chrome. Pe unele browsere alternative, Scene Viewer nu pornește.",
        ],
      },
      { type: "h2", text: "Ce verifici înainte de o oră sau o prezentare" },
      {
        type: "ol",
        items: [
          "Deschide modelul pe telefonul cu care vei lucra, nu doar pe calculator.",
          "Apasă efectiv butonul de AR, nu te opri la rotirea pe ecran.",
          "Testează în încăperea reală: lumina slabă și mesele complet albe strică urmărirea suprafeței.",
          "Dacă lucrezi cu o clasă, întreabă din timp cine are iPhone și cine Android.",
        ],
      },
      { type: "h2", text: "Ce faci fără AR" },
      {
        type: "p",
        text: "Rotirea modelului pe ecran funcționează pe absolut orice dispozitiv cu un browser modern, inclusiv pe tablete vechi și pe calculatoarele din laboratorul școlii. Realitatea augmentată este un plus, nu o condiție.",
      },
    ],
    faq: [
      {
        q: "Pot converti singur un GLB în USDZ?",
        a: "Da, cu instrumentele Reality Converter de la Apple, pe macOS, sau cu convertoare online. Multe platforme generează automat ambele variante.",
      },
      {
        q: "AR merge fără internet?",
        a: "După ce modelul s-a încărcat în pagină, da. Încărcarea inițială are nevoie de conexiune.",
      },
      {
        q: "De ce obiectul apare uriaș sau minuscul?",
        a: "Din cauza unităților din fișier. Un model exportat în metri poate apărea de o mie de ori mai mare decât ar trebui.",
      },
    ],
    related: ["ce-este-fisierul-glb", "realitate-augmentata-la-clasa"],
  },

  {
    slug: "idei-de-modele-3d-pentru-copii",
    title: "20 de idei de modele 3D de făcut cu copiii",
    description:
      "Idei testate, pe grupe de vârstă, cu formularea exactă care dă rezultate bune. De la animale la planete și clădiri.",
    keywords: [
      "activitati cu copiii",
      "idei modele 3D",
      "proiecte scolare 3D",
      "activitati educative acasa",
      "ce sa creez in 3D",
    ],
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 6,
    intro:
      "Cea mai grea parte nu e tehnologia, ci prima idee. Iată douăzeci care funcționează, grupate pe vârste, cu formularea care dă cele mai bune rezultate.",
    blocks: [
      { type: "h2", text: "Cum se scrie o cerere bună" },
      {
        type: "p",
        text: "Regula, în trei cuvinte: obiect, culoare, detaliu. „Un dinozaur” dă ceva generic. „Un dinozaur verde cu solzi și coadă lungă” dă ceva ce copilul recunoaște ca fiind al lui.",
      },
      {
        type: "ul",
        items: [
          "Un singur obiect, nu o scenă. „Un castel” funcționează, „un castel cu cavaleri și cai” nu.",
          "Adjective concrete: culoare, material, formă. Nu „frumos” sau „mare”.",
          "Fără text pe obiect. Literele ies aproape întotdeauna prost.",
        ],
      },
      { type: "h2", text: "5-7 ani: lucruri pe care le recunosc" },
      {
        type: "ul",
        items: [
          "Un elefant gri cu urechi mari",
          "O banană galbenă coaptă",
          "O mașină de pompieri roșie",
          "Un cățel maro cu urechi blănoase",
          "Un tort cu trei etaje și lumânări",
          "O casă cu acoperiș roșu și horn",
        ],
      },
      { type: "h2", text: "8-10 ani: lucruri pe care le studiază" },
      {
        type: "ul",
        items: [
          "Planeta Saturn cu inele",
          "Un vulcan cu lavă care curge",
          "Un schelet de dinozaur",
          "O corabie cu pânze albe",
          "Un far alb cu dungi roșii",
          "O piramidă egipteană din piatră",
          "Un fluture cu aripi portocalii",
        ],
      },
      { type: "h2", text: "11-14 ani: lucruri care cer precizie" },
      {
        type: "ul",
        items: [
          "O celulă vegetală cu perete și nucleu vizibile",
          "Inima omului cu cele patru camere",
          "Molecula de apă",
          "O stație spațială orbitală",
          "Un cristal de sare",
          "Colosseumul din Roma",
          "Un microscop optic",
        ],
      },
      {
        type: "note",
        text: "Pentru grupa mare, exercițiul cel mai util nu e crearea, ci compararea: doi elevi descriu același obiect diferit și analizează de ce au ieșit rezultate diferite.",
      },
      { type: "h2", text: "Ce iese prost, indiferent de vârstă" },
      {
        type: "ul",
        items: [
          "Personaje cunoscute din desene animate — sunt și protejate prin drepturi de autor.",
          "Fețe de oameni: aproape mereu deformate.",
          "Obiecte cu text sau logo pe ele.",
          "Scene cu mai multe obiecte care interacționează.",
          "Lucruri foarte subțiri: sârme, fire, pânze.",
        ],
      },
      { type: "h2", text: "Ce faci după" },
      {
        type: "p",
        text: "Un model rotit pe ecran timp de zece secunde este doar un moment plăcut. Ca să devină activitate, adaugă un pas: pune copilul să îl așeze în cameră prin realitate augmentată și să îl fotografieze lângă un obiect real, pentru comparație de mărime. Sau să scrie trei propoziții despre ce a observat rotindu-l.",
      },
    ],
    faq: [
      {
        q: "De ce iese altceva decât am cerut?",
        a: "Cel mai des, pentru că descrierea a fost prea scurtă sau prea abstractă. Adaugă o culoare și un detaliu de formă și reia.",
      },
      {
        q: "Pot cere ceva în engleză?",
        a: "Da, dar nu e nevoie. Textul în română este tradus automat înainte de generare.",
      },
      {
        q: "Câte încercări sunt necesare?",
        a: "Cu o descriere bună, prima încercare dă de obicei un rezultat utilizabil. Reformularea ajută mai mult decât repetarea aceleiași cereri.",
      },
    ],
    related: ["cum-transformi-o-poza-in-model-3d", "sistemul-solar-cu-modele-3d"],
  },

  {
    slug: "cum-imprimi-3d-un-model-generat",
    title: "Cum imprimi 3D un model generat: ghid complet",
    description:
      "De la modelul generat la obiectul imprimat: pregătirea în Blender, setările de feliere și greșelile care strică prima încercare.",
    keywords: [
      "imprimare 3D model generat",
      "GLB in STL",
      "pregatire model pentru printare",
      "setari slicer",
      "printare 3D pentru incepatori",
    ],
    published: "2026-09-05",
    updated: "2026-09-05",
    readingMinutes: 7,
    intro:
      "Un model generat arată bine pe ecran, dar imprimanta are alte cerințe. Iată ce trebuie schimbat înainte de prima încercare, ca să nu pierzi trei ore și un metru de filament.",
    blocks: [
      { type: "h2", text: "De ce nu poți imprima direct" },
      {
        type: "p",
        text: "Un model gândit pentru afișare pe ecran nu are grijă de gravitație, de grosimea pereților sau de suprafețele închise. Imprimanta le cere pe toate trei. Diferența dintre „arată bine” și „se poate imprima” se rezolvă în cincisprezece minute de pregătire.",
      },
      { type: "h2", text: "Pasul 1: deschide-l în Blender" },
      {
        type: "p",
        text: "Blender este gratuit și importă GLB direct. La import, modelul apare de obicei fie microscopic, fie uriaș, pentru că unitățile diferă între programe.",
      },
      {
        type: "ol",
        items: [
          "File, Import, glTF 2.0 și alege fișierul.",
          "Apasă N ca să deschizi panoul lateral și vezi dimensiunile reale.",
          "Setează dimensiunea dorită în milimetri. Pentru o figurină, între 50 și 120 mm.",
          "Object, Set Origin, Origin to Geometry, apoi așază baza pe planul zero.",
        ],
      },
      { type: "h2", text: "Pasul 2: verifică geometria" },
      {
        type: "p",
        text: "Activează suplimentul 3D Print Toolbox din Preferences, Add-ons. Îți spune exact ce e în neregulă: suprafețe deschise, fețe intersectate, pereți prea subțiri.",
      },
      {
        type: "ul",
        items: [
          "Non-manifold — suprafața are găuri. Butonul Make Manifold rezolvă majoritatea cazurilor.",
          "Thin faces — pereți sub pragul imprimantei. Îngroașă-i cu modificatorul Solidify.",
          "Overhangs — suprafețe suspendate peste 45 de grade. Vor avea nevoie de suporturi.",
        ],
      },
      {
        type: "note",
        text: "Dacă modelul are multe detalii mici care oricum nu s-ar vedea la 60 mm, aplică un modificator Decimate. Fișierul scade, felierea merge mai repede și rezultatul e identic.",
      },
      { type: "h2", text: "Pasul 3: exportă și feliază" },
      {
        type: "ol",
        items: [
          "File, Export, STL. Bifează Selection Only dacă ai mai multe obiecte în scenă.",
          "Deschide STL-ul în programul de feliere: Cura, PrusaSlicer sau cel al imprimantei tale.",
          "Rotește obiectul ca să reduci suprafețele suspendate. Uneori, culcat pe spate cere zero suporturi.",
          "Verifică previzualizarea strat cu strat înainte de a trimite la imprimantă.",
        ],
      },
      { type: "h2", text: "Setări de pornire pentru o figurină" },
      {
        type: "ul",
        items: [
          "Înălțime strat 0,2 mm — echilibrul obișnuit între detaliu și timp.",
          "Umplere 15% — suficient pentru un obiect decorativ.",
          "Pereți: 3 contururi, ca detaliile de suprafață să reziste.",
          "Suporturi: doar unde e nevoie, cu unghiul setat la 50 de grade.",
          "Adeziune: brim, dacă baza are contact mic cu platforma.",
        ],
      },
      { type: "h2", text: "Greșelile care strică prima încercare" },
      {
        type: "ul",
        items: [
          "Nu ai verificat scara și obiectul iese de 3 mm sau de 3 metri.",
          "Ai lăsat modelul plutind deasupra platformei, nu așezat pe ea.",
          "Ai imprimat cu detalii sub 0,4 mm, adică sub diametrul duzei — pur și simplu nu apar.",
          "Ai sărit peste suporturi la un model cu brațe întinse.",
        ],
      },
      { type: "h2", text: "Despre licențe" },
      {
        type: "p",
        text: "Un model pe care l-ai generat tu îți aparține și îl poți imprima și vinde. Un model descărcat dintr-o bibliotecă publică vine cu o licență care trebuie citită: unele interzic explicit utilizarea comercială.",
      },
    ],
    faq: [
      {
        q: "Am nevoie de Blender?",
        a: "Pentru rezultate previzibile, da. Există și convertoare online GLB în STL, dar nu îți dau control asupra scării și nu repară geometria.",
      },
      {
        q: "Se pierde culoarea?",
        a: "Da, STL păstrează doar forma. Pentru culoare ai nevoie de o imprimantă multi-material și de formatul 3MF.",
      },
      {
        q: "Cât durează o figurină de 80 mm?",
        a: "Între trei și șase ore, în funcție de umplere și de înălțimea stratului.",
      },
    ],
    related: ["modele-3d-pentru-imprimanta-3d", "ce-este-fisierul-glb"],
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((article) => article.slug === slug);
}
