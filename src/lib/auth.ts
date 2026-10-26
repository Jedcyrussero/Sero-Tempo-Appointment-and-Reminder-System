import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret?.trim()) {
    throw new Error('JWT_SECRET environment variable is required. Set it before starting the app.');
  }
  return secret;
}

export function signToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tempo-token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      role: true,
      studentProfile: {
        select: {
          id: true,
          studentIdNo: true,
          firstName: true,
          lastName: true,
          course: true,
          yearLevel: true,
          phone: true,
          address: true,
        },
      },
    },
  });
  return user;
}

export async function requireRole(role: string): Promise<
  | { authorized: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> }
  | { authorized: false; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  if (user.role !== role) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  return { authorized: true, user };
}
