import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Wallet,
  MonitorSmartphone,
  Building2,
  Tag,
  UserRound,
  CircleCheck,
} from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/State';
import { formatCurrency, formatDate, daysUntil, timeAgo } from '../../utils/format';
import ApplyModal from './ApplyModal';

export default function InternshipDetails() {
  const { id } = useParams();
  const [ix, setIx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myApplication, setMyApplication] = useState(undefined); // undefined = checking
  const [applyOpen, setApplyOpen] = useState(false);

  /* Has the current student already applied? */
  const checkApplied = useCallback(async () => {
    try {
      const { data } = await api.get('/applications/my', {
        params: { internshipId: id, limit: 1 },
      });
      setMyApplication(data.data.applications[0] || null);
    } catch {
      setMyApplication(null);
    }
  }, [id]);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/internships/${id}`);
      setIx(data.data.internship);
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 404
          ? 'This internship does not exist or has been removed.'
          : getErrorMessage(err, 'Could not load this internship')
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
    checkApplied();
  }, [fetchDetails, checkApplied]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !ix) {
    return (
      <div className="space-y-5">
        <Link
          to="/app/internships"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to internships
        </Link>
        <ErrorState
          title="Internship unavailable"
          description={error}
          onRetry={fetchDetails}
        />
      </div>
    );
  }

  const days = daysUntil(ix.deadline);
  const closed = days < 0;

  return (
    <div className="space-y-5">
      <Link
        to="/app/internships"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to internships
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{ix.category}</Badge>
              <Badge tone={ix.workMode === 'Remote' ? 'emerald' : ix.workMode === 'Hybrid' ? 'amber' : 'sky'}>
                <MonitorSmartphone className="h-3 w-3" /> {ix.workMode}
              </Badge>
              <Badge tone={closed ? 'red' : days <= 7 ? 'amber' : 'slate'}>
                <Calendar className="h-3 w-3" />
                {closed ? 'Deadline passed' : `Closes ${formatDate(ix.deadline)}`}
              </Badge>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {ix.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                <Building2 className="h-4 w-4 text-slate-400" /> {ix.company}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {ix.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {ix.duration}
              </span>
              <span className="text-slate-400">Posted {timeAgo(ix.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="About this internship" />
            <CardBody>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {ix.description}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Skills you'll use" subtitle="Requirements listed by the employer" />
            <CardBody className="flex flex-wrap gap-2 pt-1">
              {ix.skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
                >
                  <Tag className="h-3 w-3" />
                  {s}
                </span>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Posted by" />
            <CardBody className="flex items-center gap-3 pt-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {ix.createdBy?.name || 'SkillBridge Admin'}
                </p>
                <p className="text-xs text-slate-500">Recruiter · verified listing</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Key details" />
            <CardBody className="space-y-4 pt-2">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800">
                  <Wallet className="h-4 w-4" /> Stipend
                </span>
                <span className="text-base font-extrabold text-emerald-700">
                  {formatCurrency(ix.stipend)}
                  <span className="text-xs font-semibold text-emerald-600"> /month</span>
                </span>
              </div>

              <dl className="space-y-3 text-sm">
                {[
                  [Clock, 'Duration', ix.duration],
                  [MapPin, 'Location', `${ix.location} · ${ix.workMode}`],
                  [Calendar, 'Apply by', `${formatDate(ix.deadline)}${closed ? ' (closed)' : ` (${days}d left)`}`],
                  [Building2, 'Category', ix.category],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <dt className="inline-flex items-center gap-2 text-slate-500">
                      <Icon className="h-4 w-4 text-slate-400" /> {label}
                    </dt>
                    <dd className="text-right font-medium text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-slate-100 pt-4">
                {/* -------- Apply section -------- */}
                {myApplication === undefined ? (
                  <Skeleton className="h-10 w-full rounded-lg" />
                ) : myApplication ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3">
                      <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-emerald-800">
                          Application submitted
                        </p>
                        <p className="text-xs text-emerald-600">
                          {formatDate(myApplication.appliedAt || myApplication.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <span className="text-xs font-medium text-slate-500">Current status</span>
                      <Badge tone={myApplication.status === 'Accepted' ? 'emerald' : myApplication.status === 'Rejected' ? 'red' : 'sky'}>
                        {myApplication.status}
                      </Badge>
                    </div>
                    <Link
                      to="/app/applications"
                      className="block w-full rounded-lg bg-brand-50 px-4 py-2.5 text-center text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                    >
                      Track in My Applications →
                    </Link>
                  </div>
                ) : closed ? (
                  <Button full disabled size="lg">
                    Application deadline passed
                  </Button>
                ) : (
                  <Button full size="lg" onClick={() => setApplyOpen(true)}>
                    Apply for this internship
                  </Button>
                )}
                <p className="mt-3 text-center text-xs text-slate-500">
                  {myApplication === null && !closed
                    ? 'One click — your profile details are attached automatically.'
                    : ''}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        internship={ix}
        onApplied={(app) => {
          if (app) setMyApplication(app);
          else checkApplied(); // duplicate case — refresh real state
        }}
      />
    </div>
  );
}
