import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function generateAppointmentNumber() {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `APT-${random}`;
}

export async function GET() {
  const auth = await requireRole('STUDENT');
  if (!auth.authorized) return auth.response;
  const { user } = auth;

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ appointments: [] });
  }

  const appointments = await prisma.appointment.findMany({
    where: { studentId: profile.id },
    select: {
      id: true,
      appointmentNumber: true,
      purpose: true,
      description: true,
      status: true,
      createdAt: true,
      schedule: {
        select: {
          date: true,
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ appointments });
}

export async function POST(req: NextRequest) {
  const auth = await requireRole('STUDENT');
  if (!auth.authorized) return auth.response;
  const { user } = auth;

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { scheduleId, purpose, description } = body;

    if (!scheduleId || !purpose) {
      return NextResponse.json({ error: 'Schedule and purpose are required' }, { status: 400 });
    }

    const schedule = await prisma.appointmentSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule || !schedule.isActive) {
      return NextResponse.json({ error: 'Schedule not available' }, { status: 400 });
    }

    if (schedule.slotsUsed >= schedule.capacity) {
      return NextResponse.json({ error: 'No available slots' }, { status: 400 });
    }

    const scheduleDate = new Date(schedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (scheduleDate < today) {
      return NextResponse.json({ error: 'Cannot book past dates' }, { status: 400 });
    }

    const appointment = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.create({
        data: {
          appointmentNumber: generateAppointmentNumber(),
          studentId: profile.id,
          studentUserId: user.id,
          scheduleId: schedule.id,
          purpose,
          description: description || null,
          status: 'PENDING',
        },
      });

      await tx.appointmentSchedule.update({
        where: { id: scheduleId },
        data: { slotsUsed: { increment: 1 } },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: apt.id,
          status: 'PENDING',
          changedByUserId: user.id,
          remarks: 'Appointment request submitted',
        },
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Appointment Request Submitted',
          message: `Your appointment request ${apt.appointmentNumber} is pending approval.`,
          type: 'APPOINTMENT_SUBMITTED',
          link: '/student/appointments',
        },
      });

      return apt;
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
