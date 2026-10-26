import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/tokens';

const resetSchema = z.object({
  token: z.string().trim().min(20),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
});

const invalidTokenMessage =
  'This password reset link is invalid, has already been used, or has expired. Please request a new one.';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      const passwordIssue = parsed.error.issues.find((issue) =>
        issue.path.includes('password')
      );

      return NextResponse.json(
        { error: passwordIssue?.message || invalidTokenMessage },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(parsed.data.token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      return NextResponse.json({ error: invalidTokenMessage }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const usedAt = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId, usedAt: null },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Unable to reset the password right now. Please try again later.' },
      { status: 500 }
    );
  }
}
