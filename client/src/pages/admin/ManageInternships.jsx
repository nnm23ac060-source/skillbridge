import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/client';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';
import { EmptyState, ErrorState } from '../../components/ui/State';
import { formatCurrency, formatDate, daysUntil } from '../../utils/format';
import InternshipFormModal from './InternshipFormModal';

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

export default function ManageInternships() {
  const [filters, setFilters] = useState({ q: '', category: '', mode: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ internships: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // internship being edited
  const [deleting, setDeleting] = useState(null); // internship being deleted
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10, sort: 'newest' };
      if (filters.q.trim()) params.q = filters.q.trim();
      if (filters.category) params.category = filters.category;
      if (filters.mode) params.mode = filters.mode;
      const { data: res } = await api.get('/internships', { params });
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load internships'));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const set = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const { data } = await api.delete(`/internships/${deleting._id}`);
      toast.success(data.message);
      setDeleting(null);
      fetchList();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete internship'));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Input
            name="q"
            placeholder="Search title or company…"
            icon={Search}
            value={filters.q}
            onChange={set('q')}
            aria-label="Search internships"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            name="category"
            aria-label="Category filter"
            className="w-40"
            value={filters.category}
            onChange={set('category')}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            name="mode"
            aria-label="Mode filter"
            className="w-36"
            value={filters.mode}
            onChange={set('mode')}
          >
            <option value="">All modes</option>
            {['Remote', 'Hybrid', 'On-site'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New internship
          </Button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState description={error} onRetry={fetchList} />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : data.internships.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No internships found"
          description={
            filters.q || filters.category || filters.mode
              ? 'No listings match your search — adjust the filters.'
              : 'Publish your first internship to start receiving applications.'
          }
          actionLabel={filters.q || filters.category || filters.mode ? 'Clear filters' : undefined}
          onAction={
            filters.q || filters.category || filters.mode
              ? () => setFilters({ q: '', category: '', mode: '' })
              : undefined
          }
        />
      ) : (
        <Card className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3.5 font-semibold">Internship</th>
                <th className="px-4 py-3.5 font-semibold">Location</th>
                <th className="px-4 py-3.5 font-semibold">Stipend</th>
                <th className="px-4 py-3.5 font-semibold">Deadline</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.internships.map((ix) => {
                const days = daysUntil(ix.deadline);
                const closed = days < 0;
                return (
                  <tr key={ix._id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{ix.title}</p>
                      <p className="text-xs text-slate-500">
                        {ix.company} · {ix.category} · {ix.workMode}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> {ix.location}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-emerald-600">
                      {formatCurrency(ix.stipend)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(ix.deadline)}</td>
                    <td className="px-4 py-4">
                      <Badge tone={closed ? 'red' : days <= 7 ? 'amber' : 'emerald'}>
                        {closed ? 'Closed' : `${days}d left`}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(ix);
                            setFormOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                          aria-label={`Edit ${ix.title}`}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(ix)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${ix.title}`}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      {!loading && !error && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-sm text-slate-600">
            Page <span className="font-semibold">{page}</span> of{' '}
            <span className="font-semibold">{data.pages}</span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create / edit modal */}
      <InternshipFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        internship={editing}
        onSaved={() => fetchList()}
      />

      {/* Delete confirm */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete internship?"
        subtitle="This action cannot be undone"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={deleteBusy}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteBusy} onClick={confirmDelete}>
              {!deleteBusy && 'Delete permanently'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            You are about to delete{' '}
            <span className="font-semibold text-slate-900">“{deleting?.title}”</span> from{' '}
            {deleting?.company}.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠️ All applications submitted to this internship will also be removed.
          </div>
        </div>
      </Modal>
    </div>
  );
}
