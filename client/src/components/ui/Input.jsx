import { forwardRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Input — labelled form field with error state, optional leading icon
 * and optional password visibility toggle.
 */
const Input = forwardRef(function Input(
  {
    label,
    id,
    error,
    hint,
    icon: Icon,
    type = 'text',
    toggle = false, // password show/hide
    required = false,
    className = '',
    ...rest
  },
  ref
) {
  const [visible, setVisible] = useState(false);
  const inputType = toggle ? (visible ? 'text' : 'password') : type;
  const inputId = id || rest.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          required={required}
          aria-invalid={!!error}
          className={[
            'w-full rounded-lg border bg-white py-2.5 text-sm text-slate-900 shadow-sm transition',
            'placeholder:text-slate-400 focus:outline-none focus:ring-4',
            Icon ? 'pl-10' : 'pl-3.5',
            toggle ? 'pr-11' : 'pr-3.5',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10',
          ].join(' ')}
          {...rest}
        />
        {toggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 transition hover:text-slate-600"
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
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

export default Input;
