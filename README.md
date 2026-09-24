# edu3d.ro

Platforma educationala unde copiii creeaza modele 3D din text sau din poze si le exploreaza in 3D,
AR si VR. Conturi de parinte si de profesor, credite cumparate cu Stripe.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Prisma 7** peste PostgreSQL
- **NextAuth v5** (Auth.js), sesiuni JWT
- **Replicate** pentru generarea 3D: Flux 1.1 Pro (text -> imagine) + Trellis (imagine -> GLB)
- **Cloudflare R2** pentru fisiere, servite prin `/api/storage/...`
- **Stripe Checkout** + webhook pentru credite
- **@google/model-viewer** pentru 3D si AR, **@react-three/xr** pentru VR (WebXR)

## Baza de date comuna -- de citit inainte de orice

edu3d ruleaza pe **aceeasi baza** ca `kidmy` si `3dview` (`toateproiectele`). Ca sa nu se atinga
niciodata de datele lor, toate modelele din `prisma/schema.prisma` sunt mapate cu `@@map` pe tabele
cu prefix **`edu3d_`**. Modelul `User` de aici este tabelul `edu3d_users`, complet separat de
`User`-ul folosit de celelalte platforme.

**Nu rula `prisma migrate` sau `prisma db push` pe aceasta baza.** Ambele compara schema cu tot ce
gasesc in baza, vad tabelele kidmy / 3dview / sale50 ca "drift" si propun stergerea lor.

Pentru a crea sau actualiza tabelele:

```bash
npm run db:init
```

Scriptul ruleaza `prisma/init.sql`, care contine doar `CREATE TABLE IF NOT EXISTS` si
`CREATE INDEX IF NOT EXISTS`. Este idempotent si sigur de rulat oricand. Cand adaugi un camp nou in
schema, adauga si un `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in acelasi fisier.

## Pornire locala

```bash
npm install
cp .env.example .env    # completeaza cheile
npm run db:init         # creeaza tabelele edu3d_*
npm run dev             # http://localhost:3000
```

Minimul ca sa porneasca aplicatia: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`.
Pentru generare 3D ai nevoie in plus de `REPLICATE_API_TOKEN` si de cheile R2; pentru plati, de
cheile Stripe.

## Cum functioneaza generarea

Generarea are doua etape, urmarite prin polling, ca niciun request HTTP sa nu stea blocat minute
intregi:

1. `POST /api/generate` -- valideaza textul (filtru pentru copii), retine 10 credite, porneste
   predictia si salveaza randul `edu3d_generations` cu `stage = IMAGE` (mod text) sau `MODEL` (mod
   poza).
2. `GET /api/generate/status?id=...` -- avanseaza cate un pas la fiecare apel:
   - `IMAGE` reusit -> porneste etapa `MODEL` cu imaginea obtinuta;
   - `MODEL` reusit -> descarca GLB-ul de la Replicate, il urca in R2, marcheaza `COMPLETED`;
   - esec -> returneaza creditele (`refunded = true`, ca sa nu se returneze de doua ori) si
     marcheaza `FAILED`.

Creditele se scad si se returneaza in `lib/credits.ts`, cu conditia `gte` pusa direct in `UPDATE`,
deci doi copii care apasa simultan nu pot duce soldul sub zero.

## Conturi si credite

- **Parinte** -- detine contul si creditele, creeaza pana la 12 profile de copil, vede tot ce s-a
  creat. Poate inscrie un copil intr-o clasa cu codul primit de la profesor.
- **Profesor** -- creeaza clase cu cod de acces si muta credite din contul propriu in bugetul unei
  clase. Creatiile facute in contextul clasei consuma bugetul clasei, nu contul profesorului.
- Copiii nu au cont propriu; sunt profile administrate de un adult.

## Plati

`POST /api/stripe/checkout` creeaza un rand `edu3d_purchases` cu status `PENDING` si redirectioneaza
spre Stripe. Creditele se adauga **doar** din webhook (`/api/webhooks/stripe`), printr-un
`updateMany` conditionat de `status = PENDING`, deci un eveniment retrimis de Stripe nu dubleaza
creditele.

In dashboard-ul Stripe, endpoint-ul webhook trebuie sa fie
`http://178.104.20.127:3004/api/webhooks/stripe` (dupa mutarea pe domeniu,
`https://edu3d.ro/api/webhooks/stripe`), cu evenimentele `checkout.session.completed` si
`checkout.session.expired`.

Stripe cere HTTPS pentru webhook-uri in modul live. Pe IP simplu, cu HTTP, poti folosi doar modul
de test; pentru incasari reale este nevoie de domeniu cu certificat.

## Deploy

Push pe `main` declanseaza `.github/workflows/deploy.yml`: build imagine Docker, push in GHCR,
apoi SSH pe server si `docker compose up -d`. Containerul asculta pe portul **3004**
(preluat de la kidmy, care a fost scos; 3003 ramane 3dview), adica
`http://178.104.20.127:3004`.

Workflow-ul ruleaza `docker rm -f kidmy-app` inainte de pornire, ca sa elibereze portul daca vechiul
container mai exista pe server.

Secrete necesare in repo: `DATABASE_URL`, `SERVER_PASSWORD`, `ENV_CONTENTS` (continutul complet al
fisierului `.env` de productie).

In `ENV_CONTENTS`, adresele publice trebuie sa arate spre server, nu spre localhost:

```
NEXTAUTH_URL="http://178.104.20.127:3004"
NEXT_PUBLIC_BASE_URL="http://178.104.20.127:3004"
NEXT_PUBLIC_APP_URL="http://178.104.20.127:3004"
```

`NEXT_PUBLIC_BASE_URL` este folosit doar pe server (linkuri catre `/api/storage`, adresele de
retur Stripe, `metadataBase`), deci nu trebuie pasat ca build-arg in Docker.

**Atentie la mutarea ulterioara pe domeniu:** `edu3d_generations.modelUrl` se salveaza ca adresa
absoluta, construita din `NEXT_PUBLIC_BASE_URL` in momentul generarii. Cand treci de pe IP pe
`https://edu3d.ro`, modelele create pana atunci vor pastra adresa veche si trebuie actualizate cu un
UPDATE simplu:

```sql
UPDATE edu3d_generations
SET "modelUrl" = replace("modelUrl", 'http://178.104.20.127:3004', 'https://edu3d.ro'),
    "thumbnailUrl" = replace("thumbnailUrl", 'http://178.104.20.127:3004', 'https://edu3d.ro');
```

## Structura

```
app/
  api/            backend (generate, library, upload, storage, stripe, cron)
  creeaza/        atelierul: text -> 3D si imagine -> 3D
  modele/         biblioteca externa + creatiile publice
  modele/[uid]/   model din biblioteca, servit de noi
  model/[id]/     creatie proprie, 3D + AR
  vr/[id]/        vizualizare imersiva WebXR
  tarife/         pachete de credite si plata
  parinte/        zona parintelui
  clasa/          zona profesorului
components/       UI reutilizabil (ModelViewer, VRScene, Workshop, ...)
lib/              db, credite, replicate, r2, stripe, moderare, drepturi de acces
prisma/           schema si init.sql
```

## Biblioteca de modele

Cautarea foloseste Sketchfab, dar afisarea nu: din momentul in care un model e
deschis prima data, fisierul ajunge la noi si e servit din R2, in acelasi
`ModelViewer` ca modelele generate, cu acelasi AR. Nu se incarca niciun player
extern.

**Nu descarcam biblioteca in avans.** Cache-ul se face la accesare:

1. cineva deschide `/modele/<uid>`;
2. daca modelul nu e in `edu3d_library_models`, un utilizator autentificat il
   poate aduce prin `POST /api/library/cache` -- descarcam GLB-ul (si USDZ-ul,
   daca exista, pentru AR pe iPhone), il urcam in R2 sub `library/<uid>.glb` si
   marcam randul `READY`;
3. de la al doilea vizitator incolo, modelul se serveste direct de la noi.

Prima descarcare cere autentificare, ca sa nu plateasca platforma banda pentru
trafic anonim. Vizualizarea unui model deja adus este publica. Nu se consuma
credite: creditele sunt doar pentru generare.

### Eliberarea spatiului

`GET /api/cron/cleanup-library`, protejat cu `CRON_SECRET`, sterge din R2:

- modelele neaccesate de peste 30 de zile;
- cele mai vechi accesate, cat timp cache-ul depaseste 20 GB.

Stergerea nu pierde nimic: modelul se aduce din nou la urmatoarea accesare, in
cateva secunde. Creatiile utilizatorilor (`edu3d_generations`) nu sunt atinse
niciodata de acest job -- acelea sunt platite cu credite.

De rulat zilnic din crontab pe server:

```
0 4 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://edu3d.ro/api/cron/cleanup-library
```

### Licente

Cautarea este restransa la `cc0`, `by` si `by-sa` (vezi `ALLOWED_LICENSES` din
`lib/sketchfab.ts`) -- singurele care permit re-gazduirea fisierului intr-un
produs comercial. NC si ND sunt excluse intentionat. Numele autorului si licenta
se afiseaza pe pagina modelului, cerinta a licentelor CC-BY.

### Lucrarile ajung la capat si fara browser

Pipeline-ul avanseaza cate un pas la fiecare apel al rutei de status. Daca ar
depinde doar de pollingul din pagina, o lucrare la care utilizatorul inchide
tabul ar ramane vesnic `PROCESSING`: predictia se termina la Replicate, dar
nimeni nu mai descarca rezultatul, iar creditele raman consumate.

De aceea logica sta in `lib/generation-pipeline.ts` si este apelata din doua
locuri: ruta de status (cat timp pagina e deschisa) si
`GET /api/cron/advance-generations`, protejat cu `CRON_SECRET`.

De rulat din minut in minut, pe langa curatarea bibliotecii:

```
* * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://edu3d.ro/api/cron/advance-generations
0 4 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://edu3d.ro/api/cron/cleanup-library
```

Jobul ignora lucrarile mai noi de un minut (le lasa pe seama pollingului) si
proceseaza maximum 10 pe rulare.
