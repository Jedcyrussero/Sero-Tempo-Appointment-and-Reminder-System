import nodemailer from 'nodemailer';

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

function getMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    return null;
  }

  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  if (!Number.isFinite(port)) {
    return null;
  }

  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureEnv === 'true' || (secureEnv === undefined && port === 465);

  return {
    host,
    port,
    secure,
    user,
    password,
    from: process.env.SMTP_FROM?.trim() || user,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function isEmailConfigured() {
  return getMailConfig() !== null;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  expiresInMinutes,
}: {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
}) {
  const config = getMailConfig();
  if (!config) {
    throw new Error('EMAIL_NOT_CONFIGURED');
  }

  const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'TEMPO';
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const safeAppName = escapeHtml(appName);
  const safeUrl = escapeHtml(resetUrl);

  await transporter.sendMail({
    from: config.from,
    to,
    subject: `${appName} password reset request`,
    text: [
      `We received a request to reset your ${appName} password.`,
      '',
      `Reset your password using this link: ${resetUrl}`,
      '',
      `This link expires in ${expiresInMinutes} minutes. If you did not request a password reset, you can safely ignore this email.`,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1F2937; line-height: 1.6; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #1E3A8A; margin-bottom: 16px;">${safeAppName} Password Reset</h2>
        <p>We received a request to reset your ${safeAppName} password.</p>
        <p style="margin: 24px 0;">
          <a href="${safeUrl}" style="background: #2563EB; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">Reset Password</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #2563EB;">${safeUrl}</p>
        <p>This link expires in ${expiresInMinutes} minutes. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}
