import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de confidentialitate",
  description: "Cum protejam datele copiilor si ale parintilor pe edu3d.ro.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl font-extrabold">Politica de confidentialitate</h1>
      <p className="mt-2 text-ink-soft">Ultima actualizare: septembrie 2026</p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold">Ce date colectam</h2>
          <ul className="mt-2 space-y-2 text-ink-soft">
            <li>
              <strong>De la adultul titular:</strong> nume, adresa de email si, la achizitie, datele
              de facturare. Parola este stocata doar sub forma de hash.
            </li>
            <li>
              <strong>Despre profilele copiilor:</strong> doar prenumele ales de parinte, un avatar
              si, optional, anul nasterii. Nu cerem si nu stocam CNP, adresa sau fotografii de
              identitate.
            </li>
            <li>
              <strong>Continutul creat:</strong> textul introdus, pozele incarcate si modelele 3D
              rezultate.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Cum folosim datele</h2>
          <p className="mt-2 text-ink-soft">
            Datele servesc exclusiv la functionarea platformei: autentificare, generarea modelelor,
            evidenta creditelor si emiterea facturilor. Nu vindem date si nu le folosim pentru
            publicitate.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Cu cine le impartim</h2>
          <p className="mt-2 text-ink-soft">
            Doar cu furnizorii necesari livrarii serviciului: procesatorul de plati (Stripe),
            furnizorul de generare 3D (Replicate), stocarea fisierelor (Cloudflare R2) si serviciul
            de email. Textul introdus de copil ajunge la furnizorul de generare doar pentru a
            construi modelul.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Galeria publica</h2>
          <p className="mt-2 text-ink-soft">
            Publicarea unei creatii este optionala si o decide adultul titular. In galerie apar doar
            modelul, materia si prenumele copilului. Nu apar emailul, numele de familie sau alte
            date de contact. Publicarea poate fi retrasa oricand.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Cat pastram datele</h2>
          <p className="mt-2 text-ink-soft">
            Pastram datele cat timp contul este activ. La stergerea contului eliminam profilele si
            creatiile in termen de 30 de zile, cu exceptia documentelor financiare, pe care legea ne
            obliga sa le pastram.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Drepturile tale</h2>
          <p className="mt-2 text-ink-soft">
            Conform GDPR, poti cere accesul la date, corectarea, stergerea sau portarea lor, la
            adresa contact@edu3d.ro. Raspundem in cel mult 30 de zile.
          </p>
        </section>
      </div>
    </div>
  );
}
