import { forwardRef } from 'react';

/**
 * Reusable Form Input Component
 * Includes accessible labels, validation error display, and icon adornments.
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    id,
    type = 'text',
    className = '',
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder-stone-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 disabled:bg-stone-50 disabled:text-stone-400 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
              : 'border-stone-200 hover:border-stone-300'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
