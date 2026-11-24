import { Loader } from 'lucide-react';

const variants = {
  primary: 'bg-brand-600 text-white shadow-soft hover:bg-brand-700 hover:shadow-card',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
  outline: 'border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white shadow-soft hover:bg-red-700',
  success: 'bg-emerald-600 text-white shadow-soft hover:bg-emerald-700',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs gap-1.5',
  sm: 'px-3.5 py-2 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3.5 text-sm gap-2',
};

/**
 * Button — the single button used across the app.
 * props: variant, size, loading, iconLeft/iconRight (already-rendered nodes), full.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  full = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        full ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
