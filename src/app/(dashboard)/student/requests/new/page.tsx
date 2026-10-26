'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchJson } from '@/lib/client-cache';

const navItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/student/requests', label: 'Document Requests', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { href: '/student/appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: '/student/notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
];

export default function NewRequestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    documentType: '',
    purpose: '',
    additionalDetails: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJson<{ user: any }>('/api/auth/me', { ttl: 20_000 })
      .then(data => setProfile(data.user?.studentProfile))
      .catch(() => {});
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
      const res = await fetch('/api/student/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      alert('Request submitted successfully! Request Number: ' + data.request.requestNumber);
      router.push('/student/requests');
    } catch (err: any) {
      clearTimeout(timeoutId);
      setError(err.message);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="STUDENT" navItems={navItems}>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-dark">Submit Document Request</h1>
          <p className="text-text-secondary mt-1">Request official documents from the Registrar Office</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-light-blue p-4 rounded-lg">
              <h3 className="font-medium text-text-dark mb-2">Student Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-text-secondary">Name:</span> {profile?.firstName} {profile?.lastName}</div>
                <div><span className="text-text-secondary">Student ID:</span> {profile?.studentIdNo}</div>
                <div><span className="text-text-secondary">Course:</span> {profile?.course}</div>
                <div><span className="text-text-secondary">Year Level:</span> {profile?.yearLevel}</div>
              </div>
            </div>

            <div>
              <label className="label">Document Type *</label>
              <select
                required
                className="input"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              >
                <option value="">Select document type</option>
                <option value="Transcript of Records">Transcript of Records</option>
                <option value="Certificate of Enrollment">Certificate of Enrollment</option>
                <option value="Certificate of Graduation">Certificate of Graduation</option>
                <option value="Good Moral Certificate">Good Moral Certificate</option>
                <option value="Honorable Dismissal">Honorable Dismissal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">Purpose of Request *</label>
              <textarea
                required
                className="input"
                rows={3}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g., Employment, Scholarship, Transfer"
              />
            </div>

            <div>
              <label className="label">Additional Details (Optional)</label>
              <textarea
                className="input"
                rows={3}
                value={formData.additionalDetails}
                onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                placeholder="Any special instructions or details"
              />
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
