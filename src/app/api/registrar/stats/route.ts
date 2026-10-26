import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireRole('REGISTRAR_ADMIN');
  if (!auth.authorized) return auth.response;

  const statusGroups = await prisma.documentRequest.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const counts = new Map(statusGroups.map((group) => [group.status, group._count._all]));
  const total = statusGroups.reduce((sum, group) => sum + group._count._all, 0);

  return NextResponse.json({
    stats: {
      total,
      new: counts.get('SUBMITTED') ?? 0,
      underReview: counts.get('UNDER_REVIEW') ?? 0,
      needsCorrections: counts.get('REQUIREMENTS_NEEDED') ?? 0,
      awaitingPayment: counts.get('AWAITING_PAYMENT') ?? 0,
      processing: counts.get('PROCESSING') ?? 0,
      readyForPickup: counts.get('READY_FOR_PICKUP') ?? 0,
    },
  });
}
