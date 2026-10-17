import { forwardRef } from 'react';

/**
 * Reusable Textarea Component
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    id,
    rows = 4,
    className = '',
    required = false,
    ...props
  },
  ref
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder-stone-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 disabled:bg-stone-50 ${
          error
            ? 'border-rose-300 focus:ring-rose-500'
            : 'border-stone-200 hover:border-stone-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-stone-500">{helperText}</p>}
    </div>
  );
});

export default Textarea;
