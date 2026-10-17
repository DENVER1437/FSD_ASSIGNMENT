import { forwardRef } from 'react';

/**
 * Reusable Checkbox Component
 */
export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    description,
    id,
    className = '',
    ...props
  },
  ref
) {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className="w-4 h-4 rounded border-stone-300 text-brand-600 focus:ring-brand-600 focus:ring-offset-1 transition"
          {...props}
        />
      </div>
      <div className="text-sm">
        {label && (
          <label htmlFor={checkboxId} className="font-medium text-charcoal select-none cursor-pointer">
            {label}
          </label>
        )}
        {description && <p className="text-stone-500 text-xs mt-0.5">{description}</p>}
      </div>
    </div>
  );
});

export default Checkbox;
