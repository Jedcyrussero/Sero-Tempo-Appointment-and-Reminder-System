import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const pageSize = 25;
const allowedStatuses = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'RESCHEDULE_REQUESTED',
  'RESCHEDULED',
  'CANCELLED',
  'COMPLETED',
  'MISSED',
  'REJECTED',
];

export async function GET(req: NextRequest) {
  const auth = await requireRole('GUIDANCE_ADMIN');
  if (!auth.authorized) return auth.response;

  const requestedPage = Number.parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const search = (req.nextUrl.searchParams.get('search') || '').trim().slice(0, 100);
  const status = req.nextUrl.searchParams.get('status') || 'ALL';
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid appointment status filter' }, { status: 400 });
  }

  const where = {
    ...(status !== 'ALL' ? { status } : {}),
    ...(search
      ? {
          OR: [
            { appointmentNumber: { contains: search } },
            { student: { firstName: { contains: search } } },
            { student: { lastName: { contains: search } } },
          ],
        }
      : {}),
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        appointmentNumber: true,
        purpose: true,
        description: true,
        status: true,
        createdAt: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
            studentIdNo: true,
            course: true,
            yearLevel: true,
          },
        },
        schedule: {
          select: {
            date: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.appointment.count({ where }),
  ]);

  return NextResponse.json({
    appointments,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
