'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { invalidateCache } from '@/lib/client-cache';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    studentIdNo: '',
    firstName: '',
    lastName: '',
    course: '',
    yearLevel: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const authError = params.get('error');

    if (email) {
      setFormData((current) => ({ ...current, email }));
    }

    if (authError === 'google_no_account') {
      setError(
        'No TEMPO account was found for that Google email. Please complete your student registration below.'
      );
    }

    if (email || authError) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Request timed out. Please try again.');
    }, 3000);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      invalidateCache();
      router.push('/student/dashboard');
    } catch (err: any) {
      clearTimeout(timeoutId);
      setError(err.message);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-very-light-blue py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-dark">TEMPO Student Registration</h2>
          <p className="mt-2 text-sm text-text-secondary">Create your student account</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="label">Email address *</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="label">Password *</label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="studentIdNo" className="label">Student ID Number *</label>
                <input
                  id="studentIdNo"
                  required
                  className="input"
                  value={formData.studentIdNo}
                  onChange={(e) => setFormData({ ...formData, studentIdNo: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="firstName" className="label">First Name *</label>
                <input
                  id="firstName"
                  required
                  className="input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="label">Last Name *</label>
                <input
                  id="lastName"
                  required
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="course" className="label">Course *</label>
                <select
                  id="course"
                  required
                  className="input"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="">Select course</option>
                  <option value="Bachelor of Elementary Education (BEED)">Bachelor of Elementary Education (BEED)</option>
                  <option value="Bachelor of Secondary Education (BSED) - English">Bachelor of Secondary Education (BSED) - English</option>
                  <option value="Bachelor of Secondary Education (BSED) - Mathematics">Bachelor of Secondary Education (BSED) - Mathematics</option>
                  <option value="Bachelor of Secondary Education (BSED) - Science">Bachelor of Secondary Education (BSED) - Science</option>
                  <option value="Bachelor of Secondary Education (BSED) - Values Education">Bachelor of Secondary Education (BSED) - Values Education</option>
                  <option value="Bachelor of Science in Social Work (BSSW)">Bachelor of Science in Social Work (BSSW)</option>
                  <option value="Bachelor of Science in Business Administration (BSBA) - Financial Management">Bachelor of Science in Business Administration (BSBA) - Financial Management</option>
                  <option value="Bachelor of Science in Business Administration (BSBA) - HRDM">Bachelor of Science in Business Administration (BSBA) - HRDM</option>
                  <option value="Bachelor of Science in Business Administration (BSBA) - Marketing Management">Bachelor of Science in Business Administration (BSBA) - Marketing Management</option>
                  <option value="Bachelor of Science in Hospitality Management (BSHM)">Bachelor of Science in Hospitality Management (BSHM)</option>
                  <option value="Bachelor of Science in Information Technology (BSIT)">Bachelor of Science in Information Technology (BSIT)</option>
                </select>
              </div>
              <div>
                <label htmlFor="yearLevel" className="label">Year Level *</label>
                <select
                  id="yearLevel"
                  required
                  className="input"
                  value={formData.yearLevel}
                  onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                >
                  <option value="">Select year level</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="label">Phone Number</label>
                <input
                  id="phone"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-text-secondary">Already have an account? </span>
            <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
