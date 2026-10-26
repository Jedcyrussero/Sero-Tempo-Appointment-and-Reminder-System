'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PaginationControls from '@/components/PaginationControls';

const navItems = [
  { href: '/guidance/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/guidance/schedules', label: 'Manage Schedules', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: '/guidance/appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { href: '/guidance/notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
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

export default function GuidanceAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      const params = new URLSearchParams({
        page: String(page),
        search: searchTerm,
        status: statusFilter,
      });
      fetch(`/api/guidance/appointments?${params}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to load appointments');
          return res.json();
        })
        .then((data) => {
          setAppointments(data.appointments);
          setPagination(data.pagination);
        })
        .catch((error) => {
          if (error.name !== 'AbortError') console.error(error);
        });
    }, searchTerm ? 250 : 0);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [page, searchTerm, statusFilter, reloadKey]);

  const [loading, setLoading] = useState(false);

  const updateStatus = async () => {
    if (!selectedAppointment || !newStatus) return;
    setLoading(true);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      alert('Request timed out. Please try again.');
    }, 3000);

    try {
      const res = await fetch('/api/guidance/appointments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          status: newStatus,
          remarks,
        }),
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        alert('Appointment updated successfully');
        setSelectedAppointment(null);
        setNewStatus('');
        setRemarks('');
        setReloadKey((key) => key + 1);
      } else {
        alert('Failed to update appointment');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      alert('Failed to update appointment');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="GUIDANCE_ADMIN" navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Appointments</h1>
          <p className="text-text-secondary mt-1">Review and manage appointment requests</p>
        </div>

        <div className="card">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by student name or appointment number..."
              className="input flex-1"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="input md:w-64"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="RESCHEDULE_REQUESTED">Reschedule Requested</option>
              <option value="RESCHEDULED">Rescheduled</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
              <option value="MISSED">Missed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-very-light-blue">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Appointment No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Course & Year</th>
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
                      {apt.student.firstName} {apt.student.lastName}<br />
                      <span className="text-text-secondary">{apt.student.studentIdNo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-dark">
                      <div className="font-medium text-text-dark max-w-[200px]">{apt.student.course}</div>
                      <span className="text-xs text-primary font-medium">{apt.student.yearLevel}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                      {new Date(apt.schedule.date).toLocaleDateString()}<br />
                      <span className="text-text-secondary">{apt.schedule.startTime} - {apt.schedule.endTime}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-dark max-w-xs truncate">{apt.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={statusColors[apt.status]}>{apt.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedAppointment(apt)}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div className="text-center py-8 text-text-secondary">No appointments found</div>
            )}
          </div>
          <PaginationControls
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={setPage}
          />
        </div>

        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Update Appointment</h3>
              <p className="text-sm text-text-secondary mb-4">Appointment: {selectedAppointment.appointmentNumber}</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="">Select status</option>
                    <option value="CONFIRMED">Confirm</option>
                    <option value="REJECTED">Reject</option>
                    <option value="RESCHEDULED">Reschedule</option>
                    <option value="CANCELLED">Cancel</option>
                    <option value="COMPLETED">Mark as Completed</option>
                    <option value="MISSED">Mark as Missed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Remarks</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add notes"
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={updateStatus} disabled={loading} className="btn-primary flex-1">{loading ? 'Updating...' : 'Update'}</button>
                  <button onClick={() => setSelectedAppointment(null)} disabled={loading} className="btn-secondary flex-1">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
