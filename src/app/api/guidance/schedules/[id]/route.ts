import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'GUIDANCE_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const schedule = await prisma.appointmentSchedule.findUnique({ where: { id } });
  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  const result = await prisma.appointmentSchedule.deleteMany({
    where: {
      id,
      slotsUsed: 0,
      appointments: { none: {} },
    },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: 'Cannot delete a schedule that has been booked' },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}
