# TEMPO Setup Instructions

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update `.env` with secure values:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-very-secure-random-secret-key-here"
NEXT_PUBLIC_APP_NAME="TEMPO"
NODE_ENV="development"
```

### 3. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed admin accounts
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Admin Accounts (from seed)
- Registrar: registrar@tempo.edu / Registrar123!
- Finance: finance@tempo.edu / Finance123!
- Guidance: guidance@tempo.edu / Guidance123!

## Testing the Application

### As a Student
1. Register at /register
2. Login and go to Student Dashboard
3. Submit a document request at /student/requests/new
4. Book an appointment at /student/appointments/book (need Guidance to create schedules first)
5. Check notifications

### As Registrar Admin
1. Login with registrar credentials
2. Go to /registrar/requests
3. Update request statuses
4. Students will receive notifications

### As Finance Admin
1. Login with finance credentials
2. Go to /finance/payments
3. Verify payments (mark as Paid/Verified)
4. This may update related document request status

### As Guidance Admin
1. Login with guidance credentials
2. Go to /guidance/schedules to create available slots
3. Go to /guidance/appointments to approve/reject requests
4. Students will receive notifications

## Troubleshooting

### Database Issues
If you need to reset the database:
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
npm run prisma:seed
```

### Port Already in Use
```bash
npm run dev -- -p 3001
```

## Production Deployment Notes

- Use PostgreSQL/MySQL instead of SQLite for production
- Set strong JWT_SECRET
- Enable HTTPS
- Set NODE_ENV=production
- Configure proper CORS if needed
- For appointment reminders, set up a cron job or task scheduler

## Google Sign-In and Password Reset Setup

These features are implemented but require credentials before they can be used.
No credentials are stored in the source code or sent to the browser.

### Google OAuth

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Configure the OAuth consent screen.
3. Create an OAuth client ID with application type **Web application**.
4. Add an authorized redirect URI:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
5. Add these values to `.env`:

```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

`GOOGLE_REDIRECT_URI` must exactly match the URI registered in Google Cloud.
Restart the development server after changing `.env`. Until both
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` contain real values, the Google
button intentionally redirects back with a configuration error instead of
starting a fake login flow. The server logs will name any missing variables.

After Google authentication, users are sent to the dashboard for their existing
TEMPO role. If the Google email is not linked to an existing TEMPO account, the
user is sent to the registration page with the email prefilled. Google sign-in
does not automatically create a student profile because the existing registration
requires student ID, course, and year level. Existing accounts are never linked
unless Google reports the email as verified.

### Password reset email (SMTP)

Password reset links are delivered by email through SMTP. Add these values to `.env`:

```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-google-app-password"
SMTP_FROM="TEMPO <your-email@gmail.com>"
```

For Gmail, enable 2-Step Verification and create an **App Password**; do not use the
normal Gmail password. Other SMTP providers can be used by changing the host and
port values.

If SMTP is not configured, the forgot-password page shows a configuration error
instead of pretending an email was sent. Reset tokens are random, stored as SHA-256
hashes, expire after 60 minutes, and can only be used once.

### Database migration

The password reset feature adds a `PasswordResetToken` table. Apply it with:

```bash
npx prisma migrate deploy
```

Existing users, tables, and data are preserved.
