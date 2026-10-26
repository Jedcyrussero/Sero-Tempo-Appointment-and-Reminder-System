import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.studentProfile
        ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
        : null,
    },
    unreadCount,
  });
}
