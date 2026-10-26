'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const navItems = [
  { href: '/guidance/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/guidance/schedules', label: 'Manage Schedules', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: '/guidance/appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { href: '/guidance/notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
];

export default function GuidanceSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    capacity: '1',
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const res = await fetch('/api/guidance/schedules');
    if (res.ok) {
      const data = await res.json();
      setSchedules(data.schedules);
    }
  };

  const [loading, setLoading] = useState(false);

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      alert('Request timed out. Please try again.');
    }, 3000);

    try {
      const res = await fetch('/api/guidance/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        alert('Schedule created successfully');
        setShowForm(false);
        setFormData({ date: '', startTime: '', endTime: '', capacity: '1' });
        fetchSchedules();
      } else {
        alert('Failed to create schedule');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      alert('Failed to create schedule');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('Delete this unused schedule?')) return;

    try {
      const res = await fetch(`/api/guidance/schedules/${scheduleId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Schedule deleted successfully');
        fetchSchedules();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete schedule');
      }
    } catch {
      alert('Failed to delete schedule');
    }
  };

  return (
    <DashboardLayout role="GUIDANCE_ADMIN" navItems={navItems}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">Appointment Schedules</h1>
            <p className="text-text-secondary mt-1">Create and manage available time slots</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Schedule
          </button>
        </div>

        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-very-light-blue">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Slots Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule: any) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                    {new Date(schedule.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                    {schedule.startTime} - {schedule.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{schedule.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{schedule.slotsUsed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={schedule.isActive ? 'badge-success' : 'badge-error'}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {schedule.slotsUsed === 0 && (
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-error hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Add New Schedule</h3>
              <form onSubmit={createSchedule} className="space-y-4">
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Time</label>
                    <input
                      type="time"
                      required
                      className="input"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">End Time</label>
                    <input
                      type="time"
                      required
                      className="input"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
                  <button type="button" onClick={() => setShowForm(false)} disabled={loading} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
