import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const auth = await requireRole('REGISTRAR_ADMIN');
  if (!auth.authorized) return auth.response;
  const { user } = auth;

  try {
    const body = await req.json();
    const { requestId, status, remarks } = body;
    const allowedStatuses = [
      'UNDER_REVIEW',
      'REQUIREMENTS_NEEDED',
      'AWAITING_PAYMENT',
      'PROCESSING',
      'READY_FOR_PICKUP',
      'RELEASED',
      'REJECTED',
    ];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid request status' }, { status: 400 });
    }

    const request = await prisma.documentRequest.findUnique({
      where: { id: requestId },
      include: { submittedBy: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.documentRequest.update({
        where: { id: requestId },
        data: { status: status as any },
      });

      await tx.documentRequestStatusHistory.create({
        data: {
          documentRequestId: requestId,
          status: status as any,
          changedByUserId: user.id,
          remarks: remarks || null,
        },
      });

      // Create notification for student
      const statusMessages: any = {
        UNDER_REVIEW: 'Your document request is now under review.',
        REQUIREMENTS_NEEDED: 'Your document request requires additional information.',
        AWAITING_PAYMENT: 'Your document request is awaiting payment.',
        PROCESSING: 'Your document is being processed.',
        READY_FOR_PICKUP: 'Your document is ready for pickup.',
        RELEASED: 'Your document has been released.',
        REJECTED: 'Your document request has been rejected.',
      };

      if (statusMessages[status]) {
        await tx.notification.create({
          data: {
            userId: request.submittedByUserId,
            title: 'Request Status Updated',
            message: `${request.requestNumber}: ${statusMessages[status]}`,
            type: 'REQUEST_UPDATE',
            link: '/student/requests',
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
