import { prisma } from './prisma';

export async function findUserByEmail(email: string) {
  const normalized = email.trim();
  if (!normalized) {
    return null;
  }

  const exactMatch = await prisma.user.findUnique({ where: { email: normalized } });
  if (exactMatch) {
    return exactMatch;
  }

  const candidates = await prisma.user.findMany({
    where: { email: { contains: normalized } },
  });

  const lowerCaseEmail = normalized.toLowerCase();
  return candidates.find((candidate) => candidate.email.toLowerCase() === lowerCaseEmail) ?? null;
}
