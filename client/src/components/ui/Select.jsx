import { forwardRef } from 'react';

/**
 * Select — styled native select with optional label.
 */
const Select = forwardRef(function Select(
  { label, id, children, className = '', required = false, ...rest },
  ref
) {
  const selectId = id || rest.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        {...rest}
      >
        {children}
      </select>
    </div>
  );
});

export default Select;
