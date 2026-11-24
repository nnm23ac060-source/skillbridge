import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge, { statusTone } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/State';
import { timeAgo } from '../../utils/format';

const STATUSES = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];
const BAR_COLORS = {
  Pending: 'bg-amber-400',
  'Under Review': 'bg-sky-400',
  Shortlisted: 'bg-violet-400',
  Accepted: 'bg-emerald-400',
  Rejected: 'bg-red-400',
};

/**
 * Admin dashboard — every number below is a live aggregation
 * from GET /api/applications/admin/stats.
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/applications/admin/stats');
      setStats(data.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load dashboard statistics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState description={error} onRetry={fetchStats} />;
  if (!stats) return null;

  const { totals, statusCounts, recentApplications, topInternships, last24h } = stats;
  const maxStatus = Math.max(...STATUSES.map((s) => statusCounts[s] || 0), 1);
  const maxTop = Math.max(...topInternships.map((t) => t.count), 1);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Registered students" value={totals.students} tone="brand" />
        <StatCard icon={Briefcase} label="Total internships" value={totals.internships} tone="violet" />
        <StatCard icon={FileText} label="Total applications" value={totals.applications} tone="sky" />
        <StatCard icon={Clock} label="Pending applications" value={statusCounts.Pending} tone="amber" sub={`${last24h} in last 24h`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application statistics */}
        <Card>
          <CardHeader
            title="Application statistics"
            subtitle={`${totals.applications} total across all internships`}
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" />
                {last24h} new / 24h
              </span>
            }
          />
          <CardBody className="space-y-4">
            {STATUSES.map((s) => {
              const count = statusCounts[s] || 0;
              const pct = totals.applications ? Math.round((count / totals.applications) * 100) : 0;
              return (
                <div key={s}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">{s}</span>
                    <span className="font-semibold text-slate-900">
                      {count}
                      <span className="ml-1.5 text-xs font-normal text-slate-400">{pct}%</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS[s]}`}
                      style={{ width: `${(count / maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {totals.applications === 0 && (
              <p className="pt-1 text-center text-sm text-slate-400">
                No applications yet — statistics will appear once students start applying.
              </p>
            )}
          </CardBody>
        </Card>

        {/* Top internships */}
        <Card>
          <CardHeader title="Most applied internships" subtitle="Top listings by application volume" />
          <CardBody className="space-y-4">
            {topInternships.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Nothing here yet — publish internships to start receiving applications.
              </p>
            ) : (
              topInternships.map((t, i) => (
                <div key={t.internshipId} className="flex items-center gap-4">
                  <span className="w-5 shrink-0 text-sm font-bold text-slate-300">#{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{t.title}</p>
                    <p className="truncate text-xs text-slate-500">{t.company}</p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${(t.count / maxTop) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                    {t.count}
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent applications */}
      <Card>
        <CardHeader
          title="Recent applications"
          subtitle="Latest submissions from students"
          action={
            <Link
              to="/admin/applications"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              Review all
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <CardBody className="pt-2">
          {recentApplications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Inbox className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No applications yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentApplications.map((a) => (
                <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {a.student?.name || 'Unknown student'}
                      <span className="ml-2 font-normal text-slate-400">→</span>{' '}
                      <span className="font-medium text-slate-700">{a.internship?.title}</span>
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {a.student?.email} · {timeAgo(a.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                    <Link
                      to="/admin/applications"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                    >
                      Review
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
