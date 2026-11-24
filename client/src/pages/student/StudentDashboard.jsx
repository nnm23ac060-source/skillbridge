import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CircleCheck,
  Circle,
  GraduationCap,
  Sparkles,
  Calendar,
  Mail,
  Briefcase,
  MapPin,
  Wallet,
  ArrowRight,
  FileText,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../api/client';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { Skeleton } from '../../components/ui/Spinner';
import { firstName, formatDate, formatCurrency, daysUntil } from '../../utils/format';

/**
 * Student dashboard — real data only:
 *  - profile completeness (from auth context)
 *  - total internships available (GET /internships)
 *  - recently posted internships (GET /internships?sort=newest)
 * Application stats are added with the applications module.
 */
export default function StudentDashboard() {
  const { user } = useAuth();
  const pct = user?.profileCompleteness ?? 0;

  const [stats, setStats] = useState({ total: 0, loading: true, error: false });
  const [recent, setRecent] = useState({ list: [], loading: true, error: false });
  const [appStats, setAppStats] = useState({
    summary: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/internships', { params: { limit: 1 } });
        if (!alive) return;
        setStats({ total: data.data.total, loading: false, error: false });
      } catch {
        if (alive) setStats((s) => ({ ...s, loading: false, error: true }));
      }
      try {
        const { data } = await api.get('/internships', {
          params: { limit: 4, sort: 'newest' },
        });
        if (!alive) return;
        setRecent({ list: data.data.internships, loading: false, error: false });
      } catch (err) {
        if (alive)
          setRecent((r) => ({ ...r, loading: false, error: getErrorMessage(err) }));
      }
      try {
        const { data } = await api.get('/applications/my', { params: { limit: 1 } });
        if (!alive) return;
        setAppStats({ summary: data.data.summary, loading: false, error: false });
      } catch (err) {
        if (alive)
          setAppStats((s) => ({ ...s, loading: false, error: getErrorMessage(err) }));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const checklist = [
    { done: true, label: 'Create your SkillBridge account' },
    { done: (user?.education?.length || 0) > 0, label: 'Add your education details' },
    { done: (user?.skills?.length || 0) > 0, label: 'List your skills' },
    {
      done: !!(user?.linkedin || user?.github || user?.portfolio),
      label: 'Add GitHub / LinkedIn / portfolio links',
    },
    { done: !!user?.resume, label: 'Add your resume link' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-indigo-50 p-6 shadow-card sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Welcome back, {firstName(user?.name)} 🎓
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Explore fresh internships, submit applications and track every status from here.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-soft">
            <Sparkles className="h-3.5 w-3.5" />
            Student account
          </div>
        </div>
      </div>

      {/* Stats row — live counts from the database */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Internships available"
          value={stats.total}
          tone="brand"
          loading={stats.loading}
          sub={stats.error ? 'Could not load' : 'Live from the database'}
        />
        <StatCard
          icon={FileText}
          label="Applications submitted"
          value={appStats.summary?.total ?? 0}
          tone="sky"
          loading={appStats.loading}
        />
        <StatCard
          icon={Clock}
          label="Pending applications"
          value={appStats.summary?.Pending ?? 0}
          tone="amber"
          loading={appStats.loading}
        />
        <StatCard
          icon={CircleCheck}
          label="Accepted applications"
          value={appStats.summary?.Accepted ?? 0}
          tone="emerald"
          loading={appStats.loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile completeness */}
        <Card>
          <CardHeader title="Profile strength" subtitle="Recruiters prefer complete profiles" />
          <CardBody>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-slate-900">{pct}%</span>
              <span className="text-xs font-medium text-slate-500">
                {pct === 100 ? 'Profile complete 🎉' : 'Keep going!'}
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Complete profiles get more interview callbacks. Add education, skills and links
              from your profile page.
            </p>
          </CardBody>
        </Card>

        {/* Getting started checklist */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Getting started"
            subtitle="Finish these steps to start applying"
            action={
              <Link
                to="/app/profile"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
              >
                Complete profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <CardBody className="pt-3">
            <ul className="space-y-3">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  {item.done ? (
                    <CircleCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                  )}
                  <span
                    className={`text-sm ${
                      item.done ? 'text-slate-400 line-through' : 'text-slate-700'
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Application status summary (real data) */}
      <Card>
        <CardHeader
          title="Application status summary"
          action={
            <Link
              to="/app/applications"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              Manage
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <CardBody className="pt-3">
          {appStats.loading ? (
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : appStats.error ? (
            <p className="py-4 text-center text-sm text-slate-500">
              Could not load application statistics.
            </p>
          ) : !appStats.summary || appStats.summary.total === 0 ? (
            <div className="py-4 text-center text-sm text-slate-500">
              No applications yet — your status breakdown will appear here after your first
              application.{' '}
              <Link to="/app/internships" className="font-semibold text-brand-600 hover:text-brand-700">
                Explore internships →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'].map((s) => {
                const count = appStats.summary[s] || 0;
                const pct = appStats.summary.total
                  ? Math.round((count / appStats.summary.total) * 100)
                  : 0;
                const bar = {
                  Pending: 'bg-amber-400',
                  'Under Review': 'bg-sky-400',
                  Shortlisted: 'bg-violet-400',
                  Accepted: 'bg-emerald-400',
                  Rejected: 'bg-red-400',
                }[s];
                return (
                  <div key={s} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{s}</span>
                      <span className="text-base font-extrabold text-slate-900">{count}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${bar} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recently posted internships (real data) */}
      <Card>
        <CardHeader
          title="Recently posted internships"
          subtitle="Fresh opportunities added by recruiters"
          action={
            <Link
              to="/app/internships"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <CardBody className="pt-3">
          {recent.loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : recent.error ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Could not load recent internships right now.
            </p>
          ) : recent.list.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No internships posted yet — check back soon.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recent.list.map((ix) => {
                const days = daysUntil(ix.deadline);
                return (
                  <Link
                    key={ix._id}
                    to={`/app/internships/${ix._id}`}
                    className="group rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white hover:shadow-card"
                  >
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
                      {ix.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{ix.company}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {ix.location}
                      </span>
                      <span className="inline-flex items-center font-semibold text-emerald-600">
                        <Wallet className="h-3 w-3" /> {formatCurrency(ix.stipend)}
                      </span>
                    </div>
                    <p
                      className={`mt-2 text-[11px] font-semibold ${
                        days < 0 ? 'text-red-500' : days <= 7 ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    >
                      {days < 0 ? 'Deadline passed' : days === 0 ? 'Closes today' : `Closes in ${days} days`}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Account summary */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">
                {user?.education?.[0]
                  ? `${user.education[0].degree}${user.education[0].fieldOfStudy ? `, ${user.education[0].fieldOfStudy}` : ''}`
                  : 'No education added yet'}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.email}</p>
              <p className="text-xs text-slate-500">Sign-in email</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {formatDate(user?.createdAt)}
              </p>
              <p className="text-xs text-slate-500">Member since</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
