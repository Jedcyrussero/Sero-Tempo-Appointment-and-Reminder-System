'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [tokenChecked, setTokenChecked] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
    setTokenChecked(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This password reset link is missing a token. Please request a new link.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password.length > 72) {
      setError('Password must be 72 characters or fewer.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unable to reset your password.');
      }

      setSuccess(data.message || 'Your password has been reset successfully.');
      setFormData({ password: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Unable to reset your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-very-light-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-dark">TEMPO</h2>
          <p className="mt-2 text-sm text-text-secondary">Choose a new password</p>
        </div>
        <div className="card">
          {!tokenChecked ? (
            <p className="text-sm text-text-secondary">Validating reset link...</p>
          ) : success ? (
            <div className="space-y-6">
              <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
              <Link href="/login" className="w-full btn-primary inline-block text-center">
                Sign In with New Password
              </Link>
            </div>
          ) : !token ? (
            <div className="space-y-6">
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
                This password reset link is missing a token. Please request a new link.
              </div>
              <Link
                href="/forgot-password"
                className="w-full btn-primary inline-block text-center"
              >
                Request a New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="password" className="label">New Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="mt-1 text-xs text-text-secondary">
                  Use at least 8 characters.
                </p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="input"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? 'Resetting password...' : 'Reset password'}
              </button>
              <div className="text-center text-sm">
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Request a new reset link
                </Link>
              </div>
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
