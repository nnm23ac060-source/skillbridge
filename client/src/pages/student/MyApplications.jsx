import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  MapPin,
  Calendar,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge, { statusTone } from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Spinner';
import { EmptyState, ErrorState } from '../../components/ui/State';
import { formatDate, daysUntil } from '../../utils/format';

const STATUS_TABS = ['All', 'Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];
const STATUS_COLORS = {
  Pending: 'bg-amber-400',
  'Under Review': 'bg-sky-400',
  Shortlisted: 'bg-violet-400',
  Accepted: 'bg-emerald-400',
  Rejected: 'bg-red-400',
};

/**
 * My Applications — student application tracker (own data fetch).
 */
export default function MyApplications() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/applications/my', { params: { limit: 100 } });
      setData(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your applications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const apps = data?.applications || [];
  const summary = data?.summary || { total: 0, Pending: 0, 'Under Review': 0, Shortlisted: 0, Accepted: 0, Rejected: 0 };

  const filtered = useMemo(() => {
    let list = apps;
    if (tab !== 'All') list = list.filter((a) => a.status === tab);
    if (q.trim()) {
      const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      list = list.filter((a) => rx.test(a.internship?.title) || rx.test(a.internship?.company));
    }
    return list;
  }, [apps, tab, q]);

  /* ------------------------------- Loading ------------------------------- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={fetchApps} />;
  }

  /* -------------------------------- Stats -------------------------------- */
  const statsRow = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={Briefcase} label="Applications submitted" value={summary.total} tone="brand" />
      <StatCard icon={Calendar} label="Pending" value={summary.Pending} tone="amber" />
      <StatCard icon={Search} label="Under review" value={summary['Under Review']} tone="sky" />
      <StatCard icon={Briefcase} label="Accepted" value={summary.Accepted} tone="emerald" />
    </div>
  );

  if (apps.length === 0) {
    return (
      <div className="space-y-6">
        {statsRow}
        <EmptyState
          icon={Briefcase}
          title="You haven't applied to anything yet"
          description="Browse the internship explorer and submit your first application — it takes less than a minute."
          actionLabel="Explore internships"
          onAction={() => navigate('/app/internships')}
        />
      </div>
    );
  }

  /* ------------------------------ Status summary ------------------------------ */
  const summaryOrder = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];

  return (
    <div className="space-y-6">
      {statsRow}

      {/* Status summary */}
      <Card>
        <CardHeader title="Application status summary" subtitle={`Across ${summary.total} application${summary.total === 1 ? '' : 's'}`} />
        <CardBody className="pt-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {summaryOrder.map((s) => {
              const count = summary[s] || 0;
              const pct = summary.total ? Math.round((count / summary.total) * 100) : 0;
              return (
                <div key={s} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between">
                    <Badge tone={statusTone(s)}>{s}</Badge>
                    <span className="text-lg font-extrabold text-slate-900">{count}</span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${STATUS_COLORS[s]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((s) => {
              const count = s === 'All' ? summary.total : summary[s] || 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTab(s)}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
                    tab === s
                      ? 'border-brand-600 bg-brand-600 text-white shadow-soft'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {s}
                  <span
                    className={[
                      'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                      tab === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                    ].join(' ')}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="lg:w-72">
            <Input
              name="appq"
              aria-label="Search my applications"
              placeholder="Search title or company…"
              icon={Search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={`No ${tab === 'All' ? '' : `“${tab} `}applications found`}
          description={
            q
              ? 'Nothing matches your search — try a different keyword.'
              : 'Applications with this status will appear here.'
          }
          actionLabel={q || tab !== 'All' ? 'Show all' : undefined}
          onAction={
            q || tab !== 'All'
              ? () => {
                  setQ('');
                  setTab('All');
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const ix = a.internship;
            const days = ix ? daysUntil(ix.deadline) : null;
            return (
              <div
                key={a._id}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700">
                      {ix?.title || 'Internship removed'}
                    </h3>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{ix?.company || '—'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {ix && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {ix.location} · {ix.workMode}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Applied {formatDate(a.appliedAt || a.createdAt)}
                    </span>
                    {ix && (
                      <span className={days < 0 ? 'text-red-500' : days <= 7 ? 'text-amber-600' : ''}>
                        {days < 0 ? 'Deadline passed' : `Deadline in ${days}d`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {ix && (
                    <Link
                      to={`/app/internships/${ix._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                    >
                      View listing
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
