import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const schedules = await prisma.appointmentSchedule.findMany({
    where: { isActive: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
  return NextResponse.json({ schedules });
}

export async function POST(req: NextRequest) {
  const auth = await requireRole('GUIDANCE_ADMIN');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { date, startTime, endTime, capacity } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const schedule = await prisma.appointmentSchedule.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        capacity: capacity ? parseInt(capacity) : 1,
        slotsUsed: 0,
        isActive: true,
      },
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Schedule creation error:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
