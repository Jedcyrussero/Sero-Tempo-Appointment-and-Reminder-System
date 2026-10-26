import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireRole('FINANCE_ADMIN');
  if (!auth.authorized) return auth.response;

  const statusGroups = await prisma.paymentRecord.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const counts = new Map(statusGroups.map((group) => [group.status, group._count._all]));
  const total = statusGroups.reduce((sum, group) => sum + group._count._all, 0);

  return NextResponse.json({
    stats: {
      total,
      awaiting: counts.get('AWAITING_PAYMENT') ?? 0,
      paid: counts.get('PAID_VERIFIED') ?? 0,
      issues: counts.get('PAYMENT_ISSUE') ?? 0,
    },
  });
}
