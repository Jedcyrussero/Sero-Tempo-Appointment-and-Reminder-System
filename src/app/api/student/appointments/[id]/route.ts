import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('STUDENT');
  if (!auth.authorized) return auth.response;
  const { user } = auth;

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { action, remarks } = body; // action: cancel, reschedule_request
    const { id: appointmentId } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, studentId: profile.id },
      include: { schedule: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot modify this appointment' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (action === 'cancel') {
        await tx.appointment.update({
          where: { id: appointmentId },
          data: { status: 'CANCELLED' },
        });

        // Free up slot
        await tx.appointmentSchedule.update({
          where: { id: appointment.scheduleId },
          data: { slotsUsed: { decrement: 1 } },
        });

        await tx.appointmentStatusHistory.create({
          data: {
            appointmentId,
            status: 'CANCELLED',
            changedByUserId: user.id,
            remarks: remarks || 'Cancelled by student',
          },
        });

        await tx.notification.create({
          data: {
            userId: user.id,
            title: 'Appointment Cancelled',
            message: `Your appointment ${appointment.appointmentNumber} has been cancelled.`,
            type: 'APPOINTMENT_UPDATE',
            link: '/student/appointments',
          },
        });
      } else if (action === 'reschedule_request') {
        await tx.appointment.update({
          where: { id: appointmentId },
          data: { status: 'RESCHEDULE_REQUESTED' },
        });

        await tx.appointmentStatusHistory.create({
          data: {
            appointmentId,
            status: 'RESCHEDULE_REQUESTED',
            changedByUserId: user.id,
            remarks: remarks || 'Reschedule requested by student',
          },
        });

        await tx.notification.create({
          data: {
            userId: user.id,
            title: 'Reschedule Requested',
            message: `Reschedule request submitted for appointment ${appointment.appointmentNumber}.`,
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
