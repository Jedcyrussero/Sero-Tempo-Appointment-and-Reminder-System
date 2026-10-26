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
  SUBMITTED: 'badge-info',
  UNDER_REVIEW: 'badge-info',
  REQUIREMENTS_NEEDED: 'badge-pending',
  AWAITING_PAYMENT: 'badge-pending',
  PROCESSING: 'badge-info',
  READY_FOR_PICKUP: 'badge-success',
  RELEASED: 'badge-success',
  REJECTED: 'badge-error',
};

const statusLabels: any = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  REQUIREMENTS_NEEDED: 'Requirements Needed',
  AWAITING_PAYMENT: 'Awaiting Payment',
  PROCESSING: 'Processing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  RELEASED: 'Released',
  REJECTED: 'Rejected',
};

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await fetch('/api/student/requests');
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests);
    }
  };

  return (
    <DashboardLayout role="STUDENT" navItems={navItems}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">My Document Requests</h1>
            <p className="text-text-secondary mt-1">Track your document requests</p>
          </div>
          <Link href="/student/requests/new" className="btn-primary">
            New Request
          </Link>
        </div>

        <div className="card overflow-x-auto">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No document requests yet</p>
              <Link href="/student/requests/new" className="text-primary hover:text-primary-dark font-medium mt-2 inline-block">
                Submit your first request
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-very-light-blue">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Request No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Document Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Request Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Payment Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req: any) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{req.requestNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{req.documentType}</td>
                    <td className="px-6 py-4 text-sm text-text-dark max-w-xs truncate">{req.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={statusColors[req.status]}>{statusLabels[req.status]}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={req.paymentRecord?.status === 'PAID_VERIFIED' ? 'badge-success' : req.paymentRecord?.status === 'PAYMENT_ISSUE' ? 'badge-error' : 'badge-pending'}>
                        {req.paymentRecord?.status === 'PAID_VERIFIED' ? 'Paid/Verified' : 
                         req.paymentRecord?.status === 'PAYMENT_ISSUE' ? 'Payment Issue' : 'Awaiting Payment'}
                      </span>
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
