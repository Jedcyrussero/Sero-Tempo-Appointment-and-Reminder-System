import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const IN_PROGRESS_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'REQUIREMENTS_NEEDED',
  'AWAITING_PAYMENT',
  'PROCESSING',
];

export async function GET() {
  const auth = await requireRole('STUDENT');
  if (!auth.authorized) return auth.response;
  const { user } = auth;

  const profile = user.studentProfile;
  if (!profile) {
    return NextResponse.json({ stats: { totalRequests: 0, inProgress: 0, upcomingAppointments: 0 } });
  }

  const [statusGroups, upcomingAppointments] = await Promise.all([
    prisma.documentRequest.groupBy({
      by: ['status'],
      where: { studentId: profile.id },
      _count: { _all: true },
    }),
    prisma.appointment.count({
      where: {
        studentId: profile.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
  ]);

  const inProgressSet = new Set(IN_PROGRESS_STATUSES);
  let totalRequests = 0;
  let inProgress = 0;

  for (const group of statusGroups) {
    totalRequests += group._count._all;
    if (inProgressSet.has(group.status)) {
      inProgress += group._count._all;
    }
  }

  return NextResponse.json({
    stats: {
      totalRequests,
      inProgress,
      upcomingAppointments,
    },
  });
}
