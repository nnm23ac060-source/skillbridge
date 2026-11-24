/** Card — base surface used across dashboards & detail pages. */
export function Card({ className = '', hover = false, children, ...rest }) {
  return (
    <div
      className={[
        'rounded-2xl border border-slate-200 bg-white shadow-card',
        hover ? 'transition hover:-translate-y-0.5 hover:shadow-card-hover' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Card header with title, optional subtitle and right-side action. */
export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 px-6 pt-5 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Card body with default padding. */
export function CardBody({ className = '', children }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}
