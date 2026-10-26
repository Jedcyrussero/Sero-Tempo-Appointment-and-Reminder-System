'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchJson, invalidateCache } from '@/lib/client-cache';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'STUDENT' | 'REGISTRAR_ADMIN' | 'FINANCE_ADMIN' | 'GUIDANCE_ADMIN';
  navItems: Array<{ href: string; label: string; icon: any }>;
}

export default function DashboardLayout({ children, role, navItems }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    fetchJson<{ user: any; unreadCount: number }>('/api/auth/me', { ttl: 20_000 })
      .then(data => {
        if (!active) return;
        if (!data.user || data.user.role !== role) {
          invalidateCache();
          router.replace('/login');
          return;
        }
        setUser(data.user);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {
        if (active) router.replace('/login');
      });

    return () => {
      active = false;
    };
  }, [role, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    invalidateCache();
    router.replace('/login');
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'STUDENT': return 'Student Portal';
      case 'REGISTRAR_ADMIN': return 'Registrar Admin';
      case 'FINANCE_ADMIN': return 'Finance Admin';
      case 'GUIDANCE_ADMIN': return 'Guidance Admin';
    }
  };

  return (
    <div className="min-h-screen bg-very-light-blue">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-primary-dark min-h-screen fixed">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">TEMPO</h1>
            <p className="text-light-blue text-sm mt-1">{getRoleTitle()}</p>
          </div>
          <nav className="mt-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-6 py-3 text-white hover:bg-primary/80 transition-colors"
              >
                <span className="mr-3 text-white">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="ml-64 flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-8 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-text-dark">Dashboard</h2>
              <div className="flex items-center gap-4">
                <Link href={`/${role.toLowerCase().replace('_admin', '')}/notifications`} className="relative">
                  <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <div className="text-sm text-text-dark">
                  {user?.email}
                </div>
                <button onClick={handleLogout} className="text-sm text-primary hover:text-primary-dark font-medium">
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
