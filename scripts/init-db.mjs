// Creeaza tabelele edu3d_* in baza comuna, fara sa atinga nimic altceva.
//
//   npm run db:init
//
// Scriptul ruleaza prisma/init.sql, care foloseste doar CREATE TABLE / CREATE INDEX
// IF NOT EXISTS. Este idempotent si sigur de rulat de mai multe ori.
// NU folosi `prisma migrate` sau `prisma db push` pe aceasta baza: ar vedea
// tabelele kidmy / 3dview ca "drift" si ar propune stergerea lor.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const here = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(here, "..", "prisma", "init.sql");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL lipseste. Completeaza .env dupa modelul din .env.example.");
  process.exit(1);
}

const client = new pg.Client({ connectionString });

try {
  const sql = await readFile(sqlPath, "utf8");

  await client.connect();
  console.log("Conectat la baza de date.");

  await client.query(sql);
  console.log("Tabelele edu3d_* sunt create si actualizate.");

  const { rows } = await client.query(
    `SELECT tablename FROM pg_tables
     WHERE schemaname = 'public' AND tablename LIKE 'edu3d\\_%'
     ORDER BY tablename`
  );
  console.log(`\n${rows.length} tabele edu3d:`);
  for (const row of rows) console.log(`  - ${row.tablename}`);
} catch (error) {
  console.error("Initializarea a esuat:", error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
