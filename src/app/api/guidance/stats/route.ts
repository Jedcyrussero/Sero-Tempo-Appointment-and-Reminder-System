import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireRole('GUIDANCE_ADMIN');
  if (!auth.authorized) return auth.response;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [statusGroups, todayAppointments, upcoming] = await Promise.all([
    prisma.appointment.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.appointment.count({
      where: {
        schedule: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      },
    }),
    prisma.appointment.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        schedule: { date: { gte: today } },
      },
    }),
  ]);

  const counts = new Map(statusGroups.map((group) => [group.status, group._count._all]));
  const completed = counts.get('COMPLETED') ?? 0;
  const cancelledMissed =
    (counts.get('CANCELLED') ?? 0) +
    (counts.get('MISSED') ?? 0) +
    (counts.get('REJECTED') ?? 0);

  return NextResponse.json({
    stats: {
      today: todayAppointments,
      pending: counts.get('PENDING') ?? 0,
      confirmed: counts.get('CONFIRMED') ?? 0,
      upcoming,
      completed,
      cancelledMissed,
    },
  });
}
