import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";
import {
  GENERATION_COST_IMAGE,
  GENERATION_COST_TEXT,
  LIBRARY_OPEN_COST,
} from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Termeni si conditii",
  description: "Termenii de utilizare a platformei edu3d.ro.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl font-extrabold">Termeni si conditii</h1>
      <p className="mt-2 text-ink-soft">Ultima actualizare: septembrie 2026</p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold">1. Cine poate folosi platforma</h2>
          <p className="mt-2 text-ink-soft">
            Contul se deschide de catre un adult: parinte, tutore legal sau cadru didactic. Adultul
            titular administreaza profilele copiilor si raspunde de utilizarea platformei de catre
            acestia. Copiii nu isi creeaza cont propriu.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">2. Credite si plati</h2>
          <p className="mt-2 text-ink-soft">
            Platforma functioneaza pe baza de credite, cumparate in avans. O creatie din text costa{" "}
            {GENERATION_COST_TEXT} credite, una din fotografie {GENERATION_COST_IMAGE} credite, iar
            deschiderea unui model din biblioteca {LIBRARY_OPEN_COST} credite, o singura data pentru
            fiecare model. Creditele nu expira si nu sunt transferabile intre conturi. Daca o
            generare esueaza din motive tehnice, creditele se returneaza automat in cont.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">3. Dreptul de retragere</h2>
          <p className="mt-2 text-ink-soft">
            Pentru continut digital livrat imediat, dreptul legal de retragere in 14 zile inceteaza
            in momentul primei utilizari a creditelor. Creditele neutilizate pot fi rambursate in
            termen de 14 zile de la achizitie, la cerere scrisa pe adresa de contact.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">4. Continutul creat</h2>
          <p className="mt-2 text-ink-soft">
            Modelele generate raman ale utilizatorului, care le poate descarca si folosi liber,
            inclusiv in scop educational sau pentru imprimare 3D. Publicarea in galeria comuna este
            optionala si poate fi retrasa oricand.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">5. Utilizare responsabila</h2>
          <p className="mt-2 text-ink-soft">
            Este interzisa incarcarea de imagini cu alte persoane fara acordul lor si crearea de
            continut violent, sexual sau care incalca drepturi de autor. Filtram automat cererile
            nepotrivite si putem suspenda conturile care incalca repetat aceste reguli.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">6. Disponibilitate</h2>
          <p className="mt-2 text-ink-soft">
            Depunem eforturi rezonabile pentru functionarea continua a platformei, dar nu garantam
            disponibilitate neintrerupta. Generarea 3D depinde de furnizori externi si poate avea
            intarzieri.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">7. Continut generat automat</h2>
          <p className="mt-2 text-ink-soft">
            Modelele tridimensionale de pe aceasta platforma sunt produse de sisteme de inteligenta
            artificiala, pornind de la textul sau fotografia furnizate de utilizator. Rezultatul
            este o interpretare statistica, nu o reprezentare masurata a realitatii.
          </p>
          <p className="mt-3 text-ink-soft">
            In consecinta:
          </p>
          <ul className="mt-2 space-y-2 text-ink-soft">
            <li>
              &bull; nu garantam acuratetea stiintifica, proportiile, dimensiunile sau corectitudinea
              detaliilor unui model generat;
            </li>
            <li>
              &bull; modelele nu trebuie folosite ca sursa unica de informare, ca material de
              referinta stiintifica sau pentru aplicatii tehnice, medicale ori de siguranta;
            </li>
            <li>
              &bull; doua cereri identice pot produce rezultate diferite, iar rezultatul nu poate fi
              garantat sau reprodus exact;
            </li>
            <li>
              &bull; nu ne asumam raspunderea pentru deciziile luate pe baza unui model generat, nici
              pentru obiectele fabricate pornind de la el, inclusiv prin imprimare 3D.
            </li>
          </ul>
          <p className="mt-3 text-ink-soft">
            Utilizatorul raspunde pentru continutul pe care il introduce si pentru modul in care
            foloseste rezultatul. Filtrele automate reduc riscul de continut nepotrivit, dar nu il
            elimina complet; orice rezultat problematic poate fi semnalat la adresa de contact si va
            fi eliminat.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">8. Legea aplicabila si litigii</h2>
          <p className="mt-2 text-ink-soft">
            Contractul este guvernat de legea romana. Eventualele litigii se solutioneaza pe cale
            amiabila, iar in lipsa unui acord, de instantele competente din Romania. Consumatorii se
            pot adresa Autoritatii Nationale pentru Protectia Consumatorilor sau platformei europene
            de solutionare online a litigiilor, ale caror adrese sunt in subsolul paginii.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">9. Datele operatorului</h2>
          <div className="mt-2 rounded-xl border border-rule p-5 text-sm text-ink-soft">
            <p>Operator: {COMPANY.name}</p>
            <p>CUI: {COMPANY.cui}</p>
            <p>Registrul Comertului: {COMPANY.regCom}</p>
            {COMPANY.address && <p>Sediu: {COMPANY.address}</p>}
            {COMPANY.phone && <p>Telefon: {COMPANY.phone}</p>}
            <p>Email: {COMPANY.email}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
