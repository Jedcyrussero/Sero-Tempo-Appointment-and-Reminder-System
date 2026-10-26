import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAppBaseUrl } from '@/lib/app-url';
import { isEmailConfigured, sendPasswordResetEmail } from '@/lib/mail';
import { prisma } from '@/lib/prisma';
import { generateResetToken, hashToken, RESET_TOKEN_TTL_MINUTES } from '@/lib/tokens';
import { findUserByEmail } from '@/lib/users';

const requestSchema = z.object({
  email: z.string().trim().email(),
});

const genericMessage =
  'If an account with that email exists, a password reset link has been sent.';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          error:
            'Password reset email is not configured yet. Please contact the administrator.',
        },
        { status: 503 }
      );
    }

    const user = await findUserByEmail(parsed.data.email);

    if (!user) {
      return NextResponse.json({ message: genericMessage });
    }

    const token = generateResetToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${getAppBaseUrl(req.url)}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
      });
    } catch (error) {
      console.error(
        'Password reset email failed:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      return NextResponse.json(
        { error: 'Unable to send the reset email right now. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Unable to process the password reset request.' },
      { status: 500 }
    );
  }
}
