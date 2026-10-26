'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const navItems = [
  { href: '/guidance/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/guidance/schedules', label: 'Manage Schedules', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: '/guidance/appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { href: '/guidance/notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
];

export default function GuidanceDashboard() {
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    confirmed: 0,
    upcoming: 0,
    completed: 0,
    cancelledMissed: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/guidance/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout role="GUIDANCE_ADMIN" navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Guidance Dashboard</h1>
          <p className="text-text-secondary mt-1">Manage counseling appointments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-text-secondary text-sm">Today's Appointments</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.today}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Pending Requests</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats.pending}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Confirmed</p>
            <p className="text-2xl font-bold text-success mt-1">{stats.confirmed}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Upcoming</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.upcoming}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Completed</p>
            <p className="text-2xl font-bold text-success mt-1">{stats.completed}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary text-sm">Cancelled/Missed</p>
            <p className="text-2xl font-bold text-error mt-1">{stats.cancelledMissed}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
