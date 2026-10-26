import { prisma } from '@/lib/prisma';

const DEFAULT_INTERVAL_MINUTES = 60;
const DEFAULT_WINDOW_HOURS = 24;

function readPositiveInteger(name: string, fallback: number) {
  const value = process.env[name];
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

async function createUpcomingAppointmentReminders(windowHours: number) {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000);
  const firstScheduleDate = new Date(now);
  firstScheduleDate.setUTCHours(0, 0, 0, 0);
  const lastScheduleDate = new Date(windowEnd);
  lastScheduleDate.setUTCHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      schedule: {
        date: { gte: firstScheduleDate, lte: lastScheduleDate },
      },
    },
    select: {
      appointmentNumber: true,
      studentUserId: true,
      schedule: {
        select: {
          date: true,
          startTime: true,
        },
      },
    },
  });

  for (const appointment of appointments) {
    const date = appointment.schedule.date.toISOString().slice(0, 10);
    const scheduledAt = new Date(`${date}T${appointment.schedule.startTime}:00.000Z`);
    if (scheduledAt < now || scheduledAt > windowEnd) continue;

    const message = `Your Guidance appointment ${appointment.appointmentNumber} is scheduled for ${scheduledAt.toLocaleString()}.`;
    const existingReminder = await prisma.notification.findFirst({
      where: {
        userId: appointment.studentUserId,
        type: 'APPOINTMENT_REMINDER',
        message,
      },
      select: { id: true },
    });
    if (existingReminder) continue;

    await prisma.notification.create({
      data: {
        userId: appointment.studentUserId,
        title: 'Upcoming Guidance Appointment',
        message,
        type: 'APPOINTMENT_REMINDER',
        link: '/student/appointments',
      },
    });
    console.info(`Appointment reminder created for ${appointment.appointmentNumber}`);
  }
}

export function startAppointmentReminderJob() {
  const intervalMinutes = readPositiveInteger(
    'APPOINTMENT_REMINDER_INTERVAL_MINUTES',
    DEFAULT_INTERVAL_MINUTES
  );
  const windowHours = readPositiveInteger(
    'APPOINTMENT_REMINDER_WINDOW_HOURS',
    DEFAULT_WINDOW_HOURS
  );

  const globalForReminders = globalThis as typeof globalThis & {
    appointmentReminderTimer?: NodeJS.Timeout;
  };
  if (globalForReminders.appointmentReminderTimer) return;

  const run = () => {
    createUpcomingAppointmentReminders(windowHours).catch((error) => {
      console.error('Appointment reminder job failed:', error);
    });
  };

  run();
  globalForReminders.appointmentReminderTimer = setInterval(
    run,
    intervalMinutes * 60 * 1000
  );
}
