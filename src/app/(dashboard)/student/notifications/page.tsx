'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const navItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/student/requests', label: 'Document Requests', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { href: '/student/appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: '/student/notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications');
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
    }
  };

  const [loading, setLoading] = useState<string | null>(null);

  const markAsRead = async (id: string) => {
    setLoading(id);
    const timeoutId = setTimeout(() => {
      setLoading(null);
    }, 3000);
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      clearTimeout(timeoutId);
      fetchNotifications();
    } catch (e) {
      clearTimeout(timeoutId);
    } finally {
      clearTimeout(timeoutId);
      setLoading(null);
    }
  };

  const markAllRead = async () => {
    setLoading('all');
    const timeoutId = setTimeout(() => {
      setLoading(null);
    }, 3000);
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      clearTimeout(timeoutId);
      fetchNotifications();
    } catch (e) {
      clearTimeout(timeoutId);
    } finally {
      clearTimeout(timeoutId);
      setLoading(null);
    }
  };

  return (
    <DashboardLayout role="STUDENT" navItems={navItems}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">Notifications</h1>
            <p className="text-text-secondary mt-1">Stay updated with your requests and appointments</p>
          </div>
          <button onClick={markAllRead} disabled={loading === 'all'} className="btn-secondary">
            {loading === 'all' ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>

        <div className="card">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-4 ${!notif.isRead ? 'bg-light-blue/50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-text-dark">{notif.title}</h3>
                      <p className="text-text-secondary text-sm mt-1">{notif.message}</p>
                      <p className="text-text-secondary text-xs mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        disabled={loading === notif.id}
                        className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-50"
                      >
                        {loading === notif.id ? '...' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
