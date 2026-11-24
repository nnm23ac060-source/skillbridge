/** Badge — small status/tag pill. `tone` drives the color. */
const tones = {
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
};

export default function Badge({ tone = 'slate', children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tones[tone] || tones.slate,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

/** Canonical tones for the five application statuses. */
export const statusTone = (status) =>
  ({
    Pending: 'amber',
    'Under Review': 'sky',
    Shortlisted: 'violet',
    Accepted: 'emerald',
    Rejected: 'red',
  }[status] || 'slate');
