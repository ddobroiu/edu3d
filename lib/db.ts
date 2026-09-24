import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 se conecteaza printr-un driver adapter, nu prin engine-ul propriu.
// Adapterul nu deschide conexiuni la construire, deci nu incetineste buildul.
const globalForPrisma = globalThis as unknown as { edu3dPrisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });
}

// Baza este comuna cu kidmy / 3dview, dar clientul acesta cunoaste doar
// tabelele edu3d_* (vezi @@map in prisma/schema.prisma).
export const prisma = globalForPrisma.edu3dPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.edu3dPrisma = prisma;
}
