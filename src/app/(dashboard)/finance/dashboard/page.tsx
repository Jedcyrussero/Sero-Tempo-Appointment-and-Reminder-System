'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const navItems = [
  { href: '/finance/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/finance/payments', label: 'Payment Records', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { href: '/finance/notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
];

export default function FinanceDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    awaiting: 0,
    paid: 0,
    issues: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/finance/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout role="FINANCE_ADMIN" navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Finance Dashboard</h1>
          <p className="text-text-secondary mt-1">Manage payment verifications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-text-secondary text-sm">Total Payment Records</p>
            <p className="text-2xl font-bold text-text-dark mt-1">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Awaiting Payment</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats.awaiting}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Paid / Verified</p>
            <p className="text-2xl font-bold text-success mt-1">{stats.paid}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Payment Issues</p>
            <p className="text-2xl font-bold text-error mt-1">{stats.issues}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
