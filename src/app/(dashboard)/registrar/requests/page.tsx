'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PaginationControls from '@/components/PaginationControls';

const navItems = [
  { href: '/registrar/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/registrar/requests', label: 'Document Requests', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { href: '/registrar/notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
];

const statusColors: any = {
  SUBMITTED: 'badge-info',
  UNDER_REVIEW: 'badge-info',
  REQUIREMENTS_NEEDED: 'badge-pending',
  AWAITING_PAYMENT: 'badge-pending',
  PROCESSING: 'badge-info',
  READY_FOR_PICKUP: 'badge-success',
  RELEASED: 'badge-success',
  REJECTED: 'badge-error',
};

export default function RegistrarRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
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
      fetch(`/api/registrar/requests?${params}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to load requests');
          return res.json();
        })
        .then((data) => {
          setRequests(data.requests);
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

  const updateStatus = async () => {
    if (!selectedRequest || !newStatus) return;
    setLoading(true);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      alert('Request timed out. Please try again.');
    }, 3000);

    try {
      const res = await fetch('/api/registrar/requests/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: newStatus,
          remarks,
        }),
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        alert('Status updated successfully');
        setSelectedRequest(null);
        setNewStatus('');
        setRemarks('');
        setReloadKey((key) => key + 1);
      } else {
        alert('Failed to update status');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      alert('Failed to update status');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="REGISTRAR_ADMIN" navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Document Requests</h1>
          <p className="text-text-secondary mt-1">Manage all document requests</p>
        </div>

        <div className="card">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by student name, student ID, or request number..."
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
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REQUIREMENTS_NEEDED">Requirements Needed</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY_FOR_PICKUP">Ready for Pickup</option>
              <option value="RELEASED">Released</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-very-light-blue">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Request No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Course & Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req: any) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{req.requestNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                      {req.studentName}<br />
                      <span className="text-text-secondary">{req.studentNumber}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-dark">
                      <div className="font-medium text-text-dark max-w-[200px]">{req.course}</div>
                      <span className="text-xs text-primary font-medium">{req.yearLevel}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{req.documentType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={statusColors[req.status]}>{req.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {requests.length === 0 && (
              <div className="text-center py-8 text-text-secondary">No requests found</div>
            )}
          </div>
          <PaginationControls
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={setPage}
          />
        </div>

        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Update Request Status</h3>
              <p className="text-sm text-text-secondary mb-4">Request: {selectedRequest.requestNumber}</p>
              <div className="space-y-4">
                <div>
                  <label className="label">New Status</label>
                  <select className="input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="">Select status</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="REQUIREMENTS_NEEDED">Requirements Needed</option>
                    <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                    <option value="RELEASED">Released</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="label">Remarks</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add notes or instructions"
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={updateStatus} disabled={loading} className="btn-primary flex-1">{loading ? 'Updating...' : 'Update'}</button>
                  <button onClick={() => setSelectedRequest(null)} disabled={loading} className="btn-secondary flex-1">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
