export async function register() {
  if (!process.env.JWT_SECRET?.trim()) {
    throw new Error(
      'JWT_SECRET environment variable is required. Set it before starting the app.'
    );
  }

  const { startAppointmentReminderJob } = await import('./lib/appointment-reminders');
  startAppointmentReminderJob();
}
