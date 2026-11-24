import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Textarea — labelled multi-line field with error state and optional counter.
 */
const Textarea = forwardRef(function Textarea(
  { label, id, error, hint, rows = 6, maxLength, showCount = false, value = '', required, className = '', ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
          {showCount && maxLength && (
            <span
              className={`text-xs tabular-nums ${value.length > maxLength ? 'text-red-500' : 'text-slate-400'}`}
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        maxLength={maxLength}
        required={required}
        aria-invalid={!!error}
        className={[
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm transition',
          'placeholder:text-slate-400 focus:outline-none focus:ring-4',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
            : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10',
        ].join(' ')}
        {...rest}
      />
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

export default Textarea;
