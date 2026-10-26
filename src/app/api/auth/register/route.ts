import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { findUserByEmail } from '@/lib/users';
import { cookies } from 'next/headers';
import { z } from 'zod';

const registrationSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const validation = registrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid registration details' },
        { status: 400 }
      );
    }

    const { email: normalizedEmail, password } = validation.data;
    const { studentIdNo, firstName, lastName, course, yearLevel, phone } = body || {};

    if (
      !studentIdNo ||
      !firstName ||
      !lastName ||
      !course ||
      !yearLevel
    ) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const existingStudentId = await prisma.studentProfile.findUnique({ where: { studentIdNo } });
    if (existingStudentId) {
      return NextResponse.json({ error: 'Student ID already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: 'STUDENT',
        studentProfile: {
          create: {
            studentIdNo,
            firstName,
            lastName,
            course,
            yearLevel,
            phone: phone || null,
          },
        },
      },
      include: { studentProfile: true },
    });

    const token = signToken({ userId: user.id, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set('tempo-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
