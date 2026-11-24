import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getInitials, firstName } from '../../utils/format';

/** Page titles by route (grows with the app). */
const TITLES = [
  ['/app/internships', 'Explore Internships'],
  ['/app/internships/details', 'Internship Details'],
  ['/app/applications', 'My Applications'],
  ['/app/profile', 'My Profile'],
  ['/app', 'Dashboard'],
  ['/admin/internships', 'Manage Internships'],
  ['/admin/applications', 'Applicants'],
  ['/admin', 'Admin Dashboard'],
];

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const title =
    TITLES.find(([prefix]) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`))?.[1] ||
    'Dashboard';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'Student';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Welcome back, {firstName(user?.name)} 👋
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">{roleLabel}</p>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-soft"
            title={user?.name}
          >
            {getInitials(user?.name)}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
