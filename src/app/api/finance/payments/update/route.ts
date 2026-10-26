import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const auth = await requireRole('FINANCE_ADMIN');
  if (!auth.authorized) return auth.response;
  const { user } = auth;

  try {
    const body = await req.json();
    const { paymentId, status, remarks } = body;
    const allowedStatuses = ['PAID_VERIFIED', 'PAYMENT_ISSUE', 'AWAITING_PAYMENT'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }

    const payment = await prisma.paymentRecord.findUnique({
      where: { id: paymentId },
      include: { documentRequest: { include: { submittedBy: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.paymentRecord.update({
        where: { id: paymentId },
        data: {
          status: status as any,
          verifiedByUserId: user.id,
          verificationDate: status === 'PAID_VERIFIED' ? new Date() : null,
        },
      });

      await tx.paymentStatusHistory.create({
        data: {
          paymentRecordId: paymentId,
          status: status as any,
          changedByUserId: user.id,
          remarks: remarks || null,
        },
      });

      // Update document request status if paid
      if (status === 'PAID_VERIFIED') {
        await tx.documentRequest.update({
          where: { id: payment.documentRequestId },
          data: { status: 'PROCESSING' },
        });
        await tx.documentRequestStatusHistory.create({
          data: {
            documentRequestId: payment.documentRequestId,
            status: 'PROCESSING',
            changedByUserId: user.id,
            remarks: 'Payment verified, processing started',
          },
        });
      }

      // Notify student
      const messages: any = {
        PAID_VERIFIED: 'Your payment has been verified.',
        PAYMENT_ISSUE: 'There is an issue with your payment. Please check with the Finance Office.',
        AWAITING_PAYMENT: 'Payment status updated to awaiting payment.',
      };

      if (messages[status]) {
        await tx.notification.create({
          data: {
            userId: payment.documentRequest.submittedByUserId,
            title: 'Payment Status Updated',
            message: `${payment.requestNumber}: ${messages[status]}`,
            type: 'PAYMENT_UPDATE',
            link: '/student/requests',
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}
