'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const navItems = [
  { href: '/registrar/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/registrar/requests', label: 'Document Requests', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { href: '/registrar/notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
];

export default function RegistrarDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    underReview: 0,
    needsCorrections: 0,
    awaitingPayment: 0,
    processing: 0,
    readyForPickup: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/registrar/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout role="REGISTRAR_ADMIN" navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Registrar Dashboard</h1>
          <p className="text-text-secondary mt-1">Manage document requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-text-secondary text-sm">Total Requests</p>
            <p className="text-2xl font-bold text-text-dark mt-1">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">New Submissions</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.new}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Under Review</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.underReview}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Needs Corrections</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats.needsCorrections}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Awaiting Payment</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats.awaitingPayment}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Processing</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.processing}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Ready for Pickup</p>
            <p className="text-2xl font-bold text-success mt-1">{stats.readyForPickup}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
