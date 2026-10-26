'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unable to send the reset email.');
      }

      setSuccess(
        data.message ||
          'If an account with that email exists, a password reset link has been sent.'
      );
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Unable to send the reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-very-light-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-dark">TEMPO</h2>
          <p className="mt-2 text-sm text-text-secondary">Reset your password</p>
        </div>
        <div className="card">
          {success ? (
            <div className="space-y-6">
              <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
              <p className="text-sm text-text-secondary">
                Check your inbox and spam folder. The link expires in 60 minutes.
              </p>
              <Link href="/login" className="w-full btn-primary inline-block text-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <p className="text-sm text-text-secondary">
                Enter the email address registered to your TEMPO account and we will send you a
                secure password reset link.
              </p>
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? 'Sending reset link...' : 'Send reset link'}
              </button>
            </form>
          )}
          {!success && (
            <div className="mt-4 text-center text-sm">
              <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
