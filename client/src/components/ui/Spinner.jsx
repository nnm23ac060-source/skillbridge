import { Loader } from 'lucide-react';

/** Inline spinner */
export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader className={`animate-spin text-brand-600 ${className}`} aria-hidden="true" />;
}

/** Full route-level loading state */
export function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6">
      <Spinner className="h-8 w-8" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

/** Centered loader for cards/sections */
export function SectionLoader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-14 ${className}`}>
      <Spinner className="h-7 w-7" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

/** Skeleton block (uses .skeleton shimmer class from index.css) */
export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}
