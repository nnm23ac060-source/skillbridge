import { NavLink, useLocation } from 'react-router-dom';
import { Briefcase, LayoutDashboard, X, Sparkles, Search, FileText, UserRound, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Navigation model — items are grouped per role and only reference
 * routes that exist (extended as features ship).
 */
const buildNav = (role) => {
  if (role === 'admin') {
    return [
      {
        section: 'Management',
        items: [
          { label: 'Dashboard', to: '/admin', end: true, icon: LayoutDashboard },
          { label: 'Internships', to: '/admin/internships', icon: Briefcase },
          { label: 'Applicants', to: '/admin/applications', icon: Users },
        ],
      },
    ];
  }
  return [
    {
      section: 'Overview',
      items: [
        { label: 'Dashboard', to: '/app', end: true, icon: LayoutDashboard },
        { label: 'Explore Internships', to: '/app/internships', icon: Search },
        { label: 'My Applications', to: '/app/applications', icon: FileText },
        { label: 'My Profile', to: '/app/profile', icon: UserRound },
      ],
    },
  ];
};

function NavItems({ role, onNavigate }) {
  const groups = buildNav(role);
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-thin">
      {groups.map((group) => (
        <div key={group.section}>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {group.section}
          </p>
          <ul className="mt-2 space-y-1">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-[inset_3px_0_0_0_theme(colors.brand.600)]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  <item.icon
                    className={[
                      'h-[18px] w-[18px] transition',
                      'text-slate-400 group-[.bg-brand-50]:text-brand-600',
                    ].join(' ')}
                  />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ onNavigate }) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
      <NavLink to="/" className="flex items-center gap-2.5" onClick={onNavigate}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <Briefcase className="h-5 w-5" />
        </span>
        <span className="text-lg font-extrabold tracking-tight text-slate-900">
          Skill<span className="text-brand-600">Bridge</span>
        </span>
      </NavLink>
    </div>
  );
}

/**
 * Sidebar — fixed on desktop (lg+), slide-over on mobile.
 * Controlled by DashboardLayout via `open` / `onClose`.
 */
export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || 'student';

  const nav = <NavItems role={role} onNavigate={onClose} />;

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <Brand />
        {nav}
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            SkillBridge v1.0 · MERN
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-card-hover animate-fade-in">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Brand onNavigate={onClose} />
            {nav}
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                SkillBridge v1.0 · MERN
              </div>
            </div>
          </aside>
        </div>
      )}
      <span className="hidden">{location.pathname}</span>
    </>
  );
}
