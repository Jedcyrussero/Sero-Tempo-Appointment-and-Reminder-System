import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function generateRequestNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `REQ-${year}${month}-${random}`;
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
    const { documentType, purpose, additionalDetails } = body;

    if (!documentType || !purpose) {
      return NextResponse.json({ error: 'Document type and purpose are required' }, { status: 400 });
    }

    const request = await prisma.$transaction(async (tx) => {
      const docRequest = await tx.documentRequest.create({
        data: {
          requestNumber: generateRequestNumber(),
          studentId: profile.id,
          submittedByUserId: user.id,
          studentName: `${profile.firstName} ${profile.lastName}`,
          studentNumber: profile.studentIdNo,
          course: profile.course,
          yearLevel: profile.yearLevel,
          documentType,
          purpose,
          additionalDetails: additionalDetails || null,
          status: 'SUBMITTED',
        },
      });

      await tx.documentRequestStatusHistory.create({
        data: {
          documentRequestId: docRequest.id,
          status: 'SUBMITTED',
          changedByUserId: user.id,
          remarks: 'Request submitted by student',
        },
      });

      // Create payment record if needed (some documents may need payment)
      await tx.paymentRecord.create({
        data: {
          documentRequestId: docRequest.id,
          requestNumber: docRequest.requestNumber,
          studentName: docRequest.studentName,
          documentType: docRequest.documentType,
          status: 'AWAITING_PAYMENT',
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Document Request Submitted',
          message: `Your request ${docRequest.requestNumber} for ${documentType} has been submitted.`,
          type: 'REQUEST_SUBMITTED',
          link: '/student/requests',
        },
      });

      return docRequest;
    });

    return NextResponse.json({ request });
  } catch (error) {
    console.error('Request creation error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireRole('STUDENT');
  if (!auth.authorized) return auth.response;
  const { user } = auth;

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ requests: [] });
  }

  const requests = await prisma.documentRequest.findMany({
    where: { studentId: profile.id },
    select: {
      id: true,
      requestNumber: true,
      documentType: true,
      purpose: true,
      status: true,
      createdAt: true,
      paymentRecord: {
        select: {
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ requests });
}
