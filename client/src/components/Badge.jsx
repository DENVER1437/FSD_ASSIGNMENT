/**
 * Reusable Badge Component
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon: Icon,
}) {
  const variants = {
    brand: 'bg-brand-50 text-brand-800 border-brand-200/80',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-800 border-rose-200/80',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    dark: 'bg-charcoal text-white border-transparent',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </span>
  );
}

export default Badge;
