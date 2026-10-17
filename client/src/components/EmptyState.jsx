import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Empty State Component
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are currently no items to display in this view.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-subtle flex items-center justify-center text-stone-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-charcoal mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-stone-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
