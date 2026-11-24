import { Inbox, RotateCcw } from 'lucide-react';
import Button from './Button';

/** EmptyState — used whenever a list has no results. */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'Results will appear here once available.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onAction}>
          <RotateCcw className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/** ErrorState — failed fetch with retry. */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Check your connection and try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" strokeLinecap="round" />
          <path d="M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
