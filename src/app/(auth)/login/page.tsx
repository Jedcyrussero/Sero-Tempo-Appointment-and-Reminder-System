
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { invalidateCache } from '@/lib/client-cache';

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // NEW: Caps Lock warning state
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('error');

    if (!authError) return;

    const messages: Record<string, string> = {
      google_not_configured:
        'Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the server environment.',
      google_cancelled:
        'Google sign-in was cancelled.',
      google_state:
        'Google sign-in could not be verified. Please try again.',
      google_failed:
        'Google sign-in failed. Please try again.',
      google_redirect_mismatch:
        'Google sign-in is misconfigured: the redirect URI does not match the one registered in Google Cloud Console.',
      google_invalid_client:
        'Google sign-in is misconfigured: the Google client ID or client secret is invalid.',
      google_email_unverified:
        'Google did not verify that email address. Please use a verified Google account.',
      google_no_account:
        'No TEMPO account was found for that Google email. Please register first.',
    };

    setError(
      messages[authError] || 'Sign in failed. Please try again.'
    );

    window.history.replaceState(
      {},
      '',
      window.location.pathname
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const email = formData.email.trim();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Request timed out. Please try again.');
    }, 15000);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: formData.password,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      invalidateCache();

      // Redirect based on user role
      if (data.user.role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (data.user.role === 'REGISTRAR_ADMIN') {
        router.push('/registrar/dashboard');
      } else if (data.user.role === 'FINANCE_ADMIN') {
        router.push('/finance/dashboard');
      } else if (data.user.role === 'GUIDANCE_ADMIN') {
        router.push('/guidance/dashboard');
      }

    } catch (err: any) {
      clearTimeout(timeoutId);
      setError(err.message);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-very-light-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-dark">
            TEMPO
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to your account
          </p>
        </div>

        <div className="card">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Login error message */}
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="label"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                required
                className="input"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-1">

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-dark"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="shrink-0 whitespace-nowrap text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Forgot Password?
                </Link>
              </div>

              <input
                id="password"
                type="password"
                required
                className="input"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }

                // NEW: Detect Caps Lock
                onKeyDown={(e) => {
                  setCapsLockOn(
                    e.getModifierState('CapsLock')
                  );
                }}

                onKeyUp={(e) => {
                  setCapsLockOn(
                    e.getModifierState('CapsLock')
                  );
                }}

                onBlur={() => {
                  setCapsLockOn(false);
                }}
              />

              {/* NEW: Caps Lock warning */}
              {capsLockOn && (
                <p
                  role="status"
                  className="mt-2 flex items-center gap-2 text-sm font-medium text-amber-600"
                >
                  <span aria-hidden="true">
                    ⚠️
                  </span>
                  Caps Lock is ON. Your password is case-sensitive.
                </p>
              )}
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>

            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-text-secondary">
                Or
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => {
              window.location.href = '/api/auth/google';
            }}
            className="w-full btn-secondary inline-flex items-center justify-center gap-3"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.29 9.14 5.38 12 5.38z"
              />
            </svg>

            Continue with Google
          </button>

          {/* Register */}
          <div className="mt-6 text-center text-sm">
            <span className="text-text-secondary">
              Don't have an account?{' '}
            </span>

            <Link
              href="/register"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Register here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
