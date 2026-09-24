import { prisma } from "./db";

export class AccessError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "AccessError";
    this.status = status;
  }
}

export type GenerationContext = {
  childId: string | null;
  /** Daca e setat, generarea se plateste din bugetul clasei. */
  classroomId: string | null;
};

/**
 * Verifica cine are voie sa creeze in numele cui.
 *
 * - un copil poate fi folosit de parintele care il administreaza sau de
 *   profesorul unei clase din care copilul face parte;
 * - o clasa poate plati doar pentru copiii inscrisi in ea.
 */
export async function resolveGenerationContext(
  userId: string,
  childId?: string | null,
  classroomId?: string | null
): Promise<GenerationContext> {
  if (!childId) {
    if (classroomId) {
      throw new AccessError("Alege intai elevul pentru care creezi modelul.", 400);
    }
    return { childId: null, classroomId: null };
  }

  const child = await prisma.childProfile.findFirst({
    where: {
      id: childId,
      OR: [{ ownerId: userId }, { memberships: { some: { classroom: { teacherId: userId } } } }],
    },
    select: { id: true, ownerId: true },
  });

  if (!child) {
    throw new AccessError("Nu ai acces la acest profil de copil.", 403);
  }

  if (!classroomId) {
    return { childId: child.id, classroomId: null };
  }

  // Parintele copilului poate folosi orice clasa in care este inscris copilul;
  // oricine altcineva trebuie sa fie chiar profesorul clasei.
  const isChildOwner = child.ownerId === userId;
  const classroom = await prisma.classroom.findFirst({
    where: {
      id: classroomId,
      active: true,
      members: { some: { childId: child.id } },
      ...(isChildOwner ? {} : { teacherId: userId }),
    },
    select: { id: true },
  });

  if (!classroom) {
    throw new AccessError("Copilul nu face parte din aceasta clasa.", 403);
  }

  return { childId: child.id, classroomId: classroom.id };
}

/** Generarile sunt vizibile proprietarului, profesorului clasei sau tuturor daca sunt publice. */
export async function canViewGeneration(generationId: string, userId?: string | null) {
  const generation = await prisma.generation.findUnique({
    where: { id: generationId },
    include: {
      child: { select: { id: true, name: true, avatar: true } },
      classroom: { select: { id: true, teacherId: true, name: true } },
    },
  });

  if (!generation) return null;
  if (generation.isPublic) return generation;
  if (!userId) return null;
  if (generation.userId === userId) return generation;
  if (generation.classroom?.teacherId === userId) return generation;

  return null;
}
