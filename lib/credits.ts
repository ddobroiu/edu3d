import { prisma } from "./db";

// Preturile stau in lib/pricing.ts, ca sa poata fi folosite si in componentele
// de browser fara sa traga Prisma dupa ele. Le reexportam pentru comoditate.
export {
  GENERATION_COST_TEXT,
  GENERATION_COST_IMAGE,
  LIBRARY_OPEN_COST,
  WELCOME_CREDITS,
  generationCost,
} from "./pricing";

export class InsufficientCreditsError extends Error {
  constructor(message = "Nu ai suficiente credite.") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

type SpendArgs = {
  /** Tipul tranzactiei, ca istoricul sa arate pe ce s-au dus creditele. */
  type?: string;
  /** Contul care plateste (parinte sau profesor). */
  userId: string;
  /** Daca e setat, creditele se iau din bugetul clasei, nu din contul profesorului. */
  classroomId?: string | null;
  amount: number;
  description: string;
};

/**
 * Scade credite atomic. Conditia `gte` este pusa direct in UPDATE, deci doi
 * copii care apasa "Creeaza" in acelasi timp nu pot trece soldul sub zero.
 */
export async function spendCredits({
  userId,
  classroomId,
  amount,
  description,
  type = "GENERATION",
}: SpendArgs) {
  await prisma.$transaction(async (tx) => {
    if (classroomId) {
      const updated = await tx.classroom.updateMany({
        where: { id: classroomId, creditPool: { gte: amount } },
        data: { creditPool: { decrement: amount } },
      });
      if (updated.count === 0) {
        throw new InsufficientCreditsError("Clasa nu mai are credite disponibile.");
      }
    } else {
      const updated = await tx.user.updateMany({
        where: { id: userId, credits: { gte: amount } },
        data: { credits: { decrement: amount }, totalCreditsUsed: { increment: amount } },
      });
      if (updated.count === 0) {
        throw new InsufficientCreditsError();
      }
    }

    await tx.creditTransaction.create({
      data: { userId, amount: -amount, type, description },
    });
  });
}

/** Da creditele inapoi cand generarea esueaza. */
export async function refundCredits({ userId, classroomId, amount, description }: SpendArgs) {
  await prisma.$transaction(async (tx) => {
    if (classroomId) {
      await tx.classroom.update({
        where: { id: classroomId },
        data: { creditPool: { increment: amount } },
      });
    } else {
      await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount }, totalCreditsUsed: { decrement: amount } },
      });
    }

    await tx.creditTransaction.create({
      data: { userId, amount, type: "REFUND", description },
    });
  });
}

/** Adauga credite dupa o plata reusita sau ca bonus. */
export async function addCredits(
  userId: string,
  amount: number,
  type: "PURCHASE" | "BONUS",
  description: string,
  purchaseId?: string
) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { credits: { increment: amount } } }),
    prisma.creditTransaction.create({
      data: { userId, amount, type, description, purchaseId },
    }),
  ]);
}

/** Profesorul muta credite din contul propriu in bugetul unei clase. */
export async function allocateToClassroom(teacherId: string, classroomId: string, amount: number) {
  await prisma.$transaction(async (tx) => {
    const classroom = await tx.classroom.findFirst({
      where: { id: classroomId, teacherId },
      select: { id: true, name: true },
    });
    if (!classroom) throw new Error("Clasa nu a fost gasita.");

    const updated = await tx.user.updateMany({
      where: { id: teacherId, credits: { gte: amount } },
      data: { credits: { decrement: amount } },
    });
    if (updated.count === 0) throw new InsufficientCreditsError();

    await tx.classroom.update({
      where: { id: classroomId },
      data: { creditPool: { increment: amount } },
    });

    await tx.creditTransaction.create({
      data: {
        userId: teacherId,
        amount: -amount,
        type: "CLASSROOM_ALLOCATION",
        description: `Credite alocate clasei ${classroom.name}`,
      },
    });
  });
}
