import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Users,
  Eye,
  ExternalLink,
  GraduationCap,
  Tag,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/client';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge, { statusTone } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';
import { EmptyState, ErrorState } from '../../components/ui/State';
import { GithubIcon, LinkedinIcon } from '../../components/ui/BrandIcons';
import { formatDate, timeAgo } from '../../utils/format';

const STATUSES = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];

export default function Applicants() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [ixFilter, setIxFilter] = useState('');
  const [internships, setInternships] = useState([]);
  const [viewing, setViewing] = useState(null); // application being viewed
  const [busyId, setBusyId] = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get('/applications', { params: { limit: 100 } });
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load applications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
    api
      .get('/internships', { params: { limit: 50 } })
      .then((r) => setInternships(r.data.data.internships))
      .catch(() => setInternships([]));
  }, [fetchApps]);

  const apps = data?.applications || [];
  const summary = data?.summary || { total: 0 };

  const filtered = useMemo(() => {
    let list = apps;
    if (tab !== 'All') list = list.filter((a) => a.status === tab);
    if (ixFilter) list = list.filter((a) => a.internship?._id === ixFilter);
    if (q.trim()) {
      const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      list = list.filter(
        (a) =>
          rx.test(a.student?.name) ||
          rx.test(a.student?.email) ||
          rx.test(a.internship?.title) ||
          rx.test(a.internship?.company)
      );
    }
    return list;
  }, [apps, tab, q, ixFilter]);

  const changeStatus = async (app, status) => {
    setBusyId(app._id);
    try {
      const { data: res } = await api.patch(`/applications/${app._id}/status`, { status });
      const updated = res.data.application;
      setData((d) =>
        d
          ? {
              ...d,
              applications: d.applications.map((a) => (a._id === app._id ? { ...a, status } : a)),
              summary: recomputeSummary(d.applications, app._id, status, d.summary),
            }
          : d
      );
      setViewing((v) => (v && v._id === app._id ? { ...v, status } : v));
      toast.success(res.message || `Marked as ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update status'));
    } finally {
      setBusyId(null);
    }
  };

  const recomputeSummary = (list, id, nextStatus, prevSummary) => {
    const prev = list.find((a) => a._id === id)?.status;
    const summaryNext = { ...prevSummary };
    if (prev && prev !== nextStatus && summaryNext[prev] != null) summaryNext[prev] -= 1;
    summaryNext[nextStatus] = (summaryNext[nextStatus] || 0) + 1;
    return summaryNext;
  };

  /* ------------------------------- Loading ------------------------------- */
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState description={error} onRetry={fetchApps} />;

  return (
    <div className="space-y-6">
      {/* Status tabs with counts */}
      <div className="flex flex-wrap gap-2">
        {['All', ...STATUSES].map((s) => {
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

      {/* Search + internship filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            name="q"
            placeholder="Search student, email, internship or company…"
            icon={Search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search applications"
          />
        </div>
        <Select
          name="ix"
          aria-label="Filter by internship"
          className="sm:w-72"
          value={ixFilter}
          onChange={(e) => setIxFilter(e.target.value)}
        >
          <option value="">All internships</option>
          {internships.map((ix) => (
            <option key={ix._id} value={ix._id}>
              {ix.title} — {ix.company}
            </option>
          ))}
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applications found"
          description={
            tab === 'All' && !q && !ixFilter
              ? 'Applications submitted by students will appear here for review.'
              : 'No applications match the current filters.'
          }
          actionLabel={tab !== 'All' || q || ixFilter ? 'Reset filters' : undefined}
          onAction={
            tab !== 'All' || q || ixFilter
              ? () => {
                  setTab('All');
                  setQ('');
                  setIxFilter('');
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div
              key={a._id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                  {(a.student?.name || '?')
                    .split(' ')
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join('')}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{a.student?.name || 'Unknown'}</p>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </div>
                  <p className="truncate text-sm text-slate-500">{a.student?.email}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    →{' '}
                    <span className="font-medium text-slate-800">
                      {a.internship?.title || 'Internship removed'}
                    </span>{' '}
                    <span className="text-slate-400">· {a.internship?.company}</span>
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Applied {formatDate(a.createdAt)} ·{' '}
                      {timeAgo(a.createdAt)}
                    </span>
                    {a.student?.skills?.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-3 w-3" /> {a.student.skills.slice(0, 3).join(', ')}
                        {a.student.skills.length > 3 ? ` +${a.student.skills.length - 3}` : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  aria-label={`Status for ${a.student?.name}`}
                  value={a.status}
                  disabled={busyId === a._id}
                  onChange={(e) => changeStatus(a, e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewing(a)}
                  aria-label={`View application of ${a.student?.name}`}
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------- Application detail modal ---------------------- */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        size="lg"
        title={viewing?.student?.name || 'Application'}
        subtitle={viewing ? `Applied ${timeAgo(viewing.createdAt)} · ${viewing.status}` : ''}
        footer={
          viewing && (
            <>
              <Button variant="ghost" onClick={() => setViewing(null)}>
                Close
              </Button>
              {viewing.status !== 'Rejected' && (
                <Button
                  variant="danger"
                  loading={busyId === viewing._id}
                  onClick={() => changeStatus(viewing, 'Rejected')}
                >
                  Reject
                </Button>
              )}
              {viewing.status !== 'Shortlisted' && viewing.status !== 'Accepted' && (
                <Button
                  variant="secondary"
                  loading={busyId === viewing._id}
                  onClick={() => changeStatus(viewing, 'Shortlisted')}
                >
                  Shortlist
                </Button>
              )}
              {viewing.status !== 'Accepted' && (
                <Button
                  variant="success"
                  loading={busyId === viewing._id}
                  onClick={() => changeStatus(viewing, 'Accepted')}
                >
                  Accept
                </Button>
              )}
            </>
          )
        }
      >
        {viewing && (
          <div className="space-y-5">
            {/* Status ribbon */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <span className="font-medium text-slate-500">Applied to:</span>
              <span className="font-semibold text-slate-800">
                {viewing.internship?.title} — {viewing.internship?.company}
              </span>
              <Badge tone={statusTone(viewing.status)} className="ml-auto">
                {viewing.status}
              </Badge>
            </div>

            {/* Cover letter */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Cover letter</h4>
              <div className="max-h-56 overflow-y-auto whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-700 scrollbar-thin">
                {viewing.coverLetter}
              </div>
            </div>

            {/* Resume */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Resume</h4>
              {viewing.resume ? (
                <a
                  href={viewing.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  Open resume link
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <p className="text-sm text-slate-400">No resume provided</p>
              )}
            </div>

            {/* Student profile */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Student profile</h4>
              <div className="space-y-4 rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    {viewing.student?.education?.length
                      ? `${viewing.student.education[0].degree}${
                          viewing.student.education[0].fieldOfStudy
                            ? `, ${viewing.student.education[0].fieldOfStudy}`
                            : ''
                        } — ${viewing.student.education[0].institution}`
                      : 'Education not provided'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(viewing.student?.skills || []).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                    >
                      {s}
                    </span>
                  ))}
                  {!viewing.student?.skills?.length && (
                    <span className="text-xs text-slate-400">No skills listed</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-xs">
                  {viewing.student?.linkedin && (
                    <a
                      href={viewing.student.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-sky-700 hover:underline"
                    >
                      <LinkedinIcon className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {viewing.student?.github && (
                    <a
                      href={viewing.student.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:underline"
                    >
                      <GithubIcon className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                  {viewing.student?.portfolio && (
                    <a
                      href={viewing.student.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
                    >
                      Portfolio <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
