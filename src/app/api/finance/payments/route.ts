import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const pageSize = 25;
const allowedStatuses = ['ALL', 'AWAITING_PAYMENT', 'PAID_VERIFIED', 'PAYMENT_ISSUE'];

export async function GET(req: NextRequest) {
  const auth = await requireRole('FINANCE_ADMIN');
  if (!auth.authorized) return auth.response;

  const requestedPage = Number.parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const search = (req.nextUrl.searchParams.get('search') || '').trim().slice(0, 100);
  const status = req.nextUrl.searchParams.get('status') || 'ALL';
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid payment status filter' }, { status: 400 });
  }

  const where = {
    ...(status !== 'ALL' ? { status } : {}),
    ...(search
      ? {
          OR: [
            { studentName: { contains: search } },
            { requestNumber: { contains: search } },
          ],
        }
      : {}),
  };

  const [payments, total] = await Promise.all([
    prisma.paymentRecord.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        requestNumber: true,
        studentName: true,
        documentType: true,
        status: true,
        createdAt: true,
        documentRequest: {
          select: {
            course: true,
            yearLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.paymentRecord.count({ where }),
  ]);

  return NextResponse.json({
    payments,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
