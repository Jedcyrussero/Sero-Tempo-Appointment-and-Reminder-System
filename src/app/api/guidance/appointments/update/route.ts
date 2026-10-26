import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const auth = await requireRole('GUIDANCE_ADMIN');
  if (!auth.authorized) return auth.response;
  const { user } = auth;

  try {
    const body = await req.json();
    const { appointmentId, status, remarks } = body;
    const allowedStatuses = [
      'CONFIRMED',
      'REJECTED',
      'RESCHEDULED',
      'CANCELLED',
      'COMPLETED',
      'MISSED',
    ];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid appointment status' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { studentUser: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: status as any },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId,
          status: status as any,
          changedByUserId: user.id,
          remarks: remarks || null,
        },
      });

      if (
        (status === 'REJECTED' || status === 'CANCELLED') &&
        appointment.status !== 'REJECTED' &&
        appointment.status !== 'CANCELLED'
      ) {
        await tx.appointmentSchedule.updateMany({
          where: { id: appointment.scheduleId, slotsUsed: { gt: 0 } },
          data: { slotsUsed: { decrement: 1 } },
        });
      }

      const messages: any = {
        CONFIRMED: 'Your Guidance appointment has been confirmed.',
        REJECTED: 'Your Guidance appointment has been rejected.',
        RESCHEDULED: 'Your appointment has been rescheduled.',
        CANCELLED: 'Your Guidance appointment has been cancelled.',
        COMPLETED: 'Your Guidance appointment has been marked as completed.',
        MISSED: 'Your Guidance appointment was marked as missed.',
      };

      if (messages[status]) {
        await tx.notification.create({
          data: {
            userId: appointment.studentUserId,
            title: 'Appointment Update',
            message: `${appointment.appointmentNumber}: ${messages[status]}`,
            type: 'APPOINTMENT_UPDATE',
            link: '/student/appointments',
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Appointment update error:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
