import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Wallet,
  MonitorSmartphone,
} from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Spinner';
import { EmptyState, ErrorState } from '../../components/ui/State';
import { formatCurrency, daysUntil, formatDate } from '../../utils/format';

const CATEGORIES = [
  'Engineering',
  'Data Science',
  'Design',
  'Marketing',
  'Finance',
  'Human Resources',
  'Operations',
  'Other',
];
const MODES = ['Remote', 'Hybrid', 'On-site'];
const STIPEND_BRACKETS = [
  { label: 'Any stipend', min: '' },
  { label: '₹10,000+', min: '10000' },
  { label: '₹20,000+', min: '20000' },
  { label: '₹25,000+', min: '25000' },
  { label: '₹30,000+', min: '30000' },
];

const DEFAULT_FILTERS = {
  q: '',
  location: '',
  category: '',
  skill: '',
  minStipend: '',
  mode: '',
  sort: 'newest',
};

/* ------------------------------- Card component ------------------------------- */
function InternshipCard({ ix }) {
  const days = daysUntil(ix.deadline);
  const closed = days < 0;

  return (
    <Link
      to={`/app/internships/${ix._id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge tone="brand">{ix.category}</Badge>
        <Badge tone={closed ? 'red' : days <= 7 ? 'amber' : 'slate'}>
          {closed ? 'Deadline passed' : days === 0 ? 'Closes today' : `Closes in ${days}d`}
        </Badge>
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition group-hover:text-brand-700">
        {ix.title}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{ix.company}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {ix.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <MonitorSmartphone className="h-3.5 w-3.5" /> {ix.workMode}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {ix.duration}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ix.skills.slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
          >
            {s}
          </span>
        ))}
        {ix.skills.length > 4 && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            +{ix.skills.length - 4}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
          <Wallet className="h-4 w-4" />
          {formatCurrency(ix.stipend)}
          <span className="font-medium text-slate-400">/ month</span>
        </span>
        <span className="text-xs font-semibold text-brand-600 transition group-hover:translate-x-0.5">
          View details →
        </span>
      </div>
    </Link>
  );
}

/* ------------------------------- Skeleton card ------------------------------- */
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="mt-4 h-5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-2/5" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3.5">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */
export default function Internships() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ internships: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const requestId = useRef(0);

  /* debounce search text */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 350);
    return () => clearTimeout(t);
  }, [filters.q]);

  const set = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedQ('');
    setPage(1);
  };

  const hasActiveFilters =
    filters.q || filters.location || filters.category || filters.skill || filters.minStipend || filters.mode;

  const fetchInternships = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12, sort: filters.sort };
      if (debouncedQ.trim()) params.q = debouncedQ.trim();
      if (filters.location.trim()) params.location = filters.location.trim();
      if (filters.category) params.category = filters.category;
      if (filters.skill.trim()) params.skill = filters.skill.trim();
      if (filters.minStipend) params.minStipend = filters.minStipend;
      if (filters.mode) params.mode = filters.mode;

      const { data } = await api.get('/internships', { params });
      if (id !== requestId.current) return; // stale response
      setResult(data.data);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(getErrorMessage(err, 'Could not load internships'));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [page, debouncedQ, filters]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const modeOptions = useMemo(() => ['', ...MODES], []);

  return (
    <div className="space-y-6">
      {/* ------------------------------ Filters ------------------------------ */}
      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input
                name="q"
                aria-label="Search internships"
                placeholder="Search title, company or skill…"
                icon={Search}
                value={filters.q}
                onChange={set('q')}
              />
            </div>
            <div className="sm:w-52">
              <Input
                name="location"
                aria-label="Filter by location"
                placeholder="Location"
                icon={MapPin}
                value={filters.location}
                onChange={set('location')}
              />
            </div>
            <Button
              variant="secondary"
              className="sm:w-auto"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sm:hidden">More filters</span>
            </Button>
          </div>

          <div className={`${showFilters ? 'grid' : 'hidden'} gap-3 sm:grid-cols-2 lg:grid-cols-4`}>
            <select
              aria-label="Category"
              value={filters.category}
              onChange={set('category')}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              aria-label="Skill"
              value={filters.skill}
              onChange={set('skill')}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              <option value="">Any skill</option>
              {['React', 'Node.js', 'Python', 'Figma', 'SQL', 'JavaScript', 'Selenium'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              aria-label="Minimum stipend"
              value={filters.minStipend}
              onChange={set('minStipend')}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              {STIPEND_BRACKETS.map((b) => (
                <option key={b.label} value={b.min}>
                  {b.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort by"
              value={filters.sort}
              onChange={set('sort')}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              <option value="newest">Newest first</option>
              <option value="deadline">Deadline soonest</option>
              <option value="stipend_desc">Highest stipend</option>
            </select>
          </div>

          {/* Work mode chips + clear */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Work mode
              </span>
              {modeOptions.map((m) => (
                <button
                  key={m || 'all'}
                  type="button"
                  onClick={() => {
                    setFilters((f) => ({ ...f, mode: m }));
                    setPage(1);
                  }}
                  className={[
                    'rounded-full border px-3 py-1 text-xs font-semibold transition',
                    filters.mode === m
                      ? 'border-brand-600 bg-brand-600 text-white shadow-soft'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {m || 'All'}
                </button>
              ))}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-brand-600 transition hover:text-brand-700"
              >
                Clear all filters ✕
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* ------------------------------ Results ------------------------------ */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {loading ? (
            'Searching…'
          ) : (
            <>
              <span className="font-semibold text-slate-900">{result.total}</span>{' '}
              internship{result.total === 1 ? '' : 's'} found
            </>
          )}
        </p>
        {hasActiveFilters && !loading && (
          <p className="text-xs text-slate-400">Filtered results</p>
        )}
      </div>

      {error ? (
        <ErrorState description={error} onRetry={fetchInternships} />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : result.internships.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No internships match your filters"
          description="Try widening your search — clear filters or search for a different skill or location."
          actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.internships.map((ix) => (
            <InternshipCard key={ix._id} ix={ix} />
          ))}
        </div>
      )}

      {/* ----------------------------- Pagination ---------------------------- */}
      {!loading && !error && result.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <span className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
            <span className="font-semibold text-slate-900">{result.pages}</span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= result.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        {result.total > 0 && `Showing as of ${formatDate(new Date())}`}
      </p>
    </div>
  );
}
