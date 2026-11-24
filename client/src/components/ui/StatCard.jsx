/** StatCard — KPI tile used on dashboards. */
export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'brand',
  loading = false,
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone] || tones.brand}`}>
          {Icon && <Icon className="h-5 w-5" />}
        </span>
        {loading && <div className="skeleton h-4 w-10 rounded-md" />}
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
        {loading ? '—' : value}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
