import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * DashboardLayout — sidebar + sticky topbar + content area.
 * Used by both /app (student) and /admin (admin) route groups;
 * the sidebar adapts to the current user's role.
 */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div key="route-content" className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
