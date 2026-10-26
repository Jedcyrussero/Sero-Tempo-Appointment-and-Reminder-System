'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

const navItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/student/requests', label: 'Document Requests', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { href: '/student/appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: '/student/notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
];

const statusColors: any = {
  PENDING: 'badge-pending',
  CONFIRMED: 'badge-success',
  RESCHEDULE_REQUESTED: 'badge-pending',
  RESCHEDULED: 'badge-info',
  CANCELLED: 'badge-error',
  COMPLETED: 'badge-success',
  MISSED: 'badge-error',
  REJECTED: 'badge-error',
};

const statusLabels: any = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  RESCHEDULE_REQUESTED: 'Reschedule Requested',
  RESCHEDULED: 'Rescheduled',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  MISSED: 'Missed',
  REJECTED: 'Rejected',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const res = await fetch('/api/student/appointments');
    if (res.ok) {
      const data = await res.json();
      setAppointments(data.appointments);
    }
  };

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const cancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(id + '_cancel');
    const timeoutId = setTimeout(() => {
      setActionLoading(null);
      alert('Request timed out. Please try again.');
    }, 3000);

    try {
      const res = await fetch(`/api/student/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        alert('Appointment cancelled successfully');
        fetchAppointments();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel appointment');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      alert('Failed to cancel appointment');
    } finally {
      clearTimeout(timeoutId);
      setActionLoading(null);
    }
  };

  const requestReschedule = async (id: string) => {
    if (!confirm('Request rescheduling for this appointment?')) return;
    setActionLoading(id + '_reschedule');
    const timeoutId = setTimeout(() => {
      setActionLoading(null);
      alert('Request timed out. Please try again.');
    }, 3000);

    try {
      const res = await fetch(`/api/student/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reschedule_request' }),
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        alert('Reschedule request submitted');
        fetchAppointments();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to request reschedule');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      alert('Failed to request reschedule');
    } finally {
      clearTimeout(timeoutId);
      setActionLoading(null);
    }
  };

  const canModify = (status: string) => {
    return status === 'PENDING' || status === 'CONFIRMED';
  };

  return (
    <DashboardLayout role="STUDENT" navItems={navItems}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">My Appointments</h1>
            <p className="text-text-secondary mt-1">View and manage your guidance appointments</p>
          </div>
          <Link href="/student/appointments/book" className="btn-primary">
            Book Appointment
          </Link>
        </div>

        <div className="card overflow-x-auto">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No appointments yet</p>
              <Link href="/student/appointments/book" className="text-primary hover:text-primary-dark font-medium mt-2 inline-block">
                Book your first appointment
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-very-light-blue">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Appointment No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((apt: any) => (
                  <tr key={apt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{apt.appointmentNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                      {new Date(apt.schedule.date).toLocaleDateString()}<br />
                      <span className="text-text-secondary">{apt.schedule.startTime} - {apt.schedule.endTime}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-dark">{apt.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={statusColors[apt.status]}>{statusLabels[apt.status]}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {canModify(apt.status) && (
                        <>
                          <button onClick={() => requestReschedule(apt.id)} disabled={actionLoading === apt.id + '_reschedule'} className="text-primary hover:text-primary-dark font-medium disabled:opacity-50">
                            {actionLoading === apt.id + '_reschedule' ? '...' : 'Reschedule'}
                          </button>
                          <button onClick={() => cancelAppointment(apt.id)} disabled={actionLoading === apt.id + '_cancel'} className="text-error hover:text-error/80 font-medium disabled:opacity-50">
                            {actionLoading === apt.id + '_cancel' ? '...' : 'Cancel'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
