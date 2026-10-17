import { Sparkles } from 'lucide-react';

/**
 * Compatibility Score Badge Component
 * Displays explainable match percentage with color tiering.
 */
export function ScoreBadge({ score, size = 'md', showLabel = true, className = '' }) {
  const getStyles = (val) => {
    if (val >= 90) {
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        ring: 'text-emerald-600',
        label: 'Top Match',
      };
    }
    if (val >= 80) {
      return {
        bg: 'bg-brand-50 border-brand-200 text-brand-800',
        ring: 'text-brand-600',
        label: 'Great Match',
      };
    }
    if (val >= 70) {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        ring: 'text-amber-600',
        label: 'Good Match',
      };
    }
    return {
      bg: 'bg-stone-100 border-stone-200 text-stone-700',
      ring: 'text-stone-500',
      label: 'Moderate Match',
    };
  };

  const info = getStyles(score);

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border ${info.bg} ${className}`}
      >
        <div className="flex items-baseline">
          <span className="text-2xl font-extrabold tracking-tight">{score}%</span>
        </div>
        <div className="border-l border-current/20 pl-3">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-90 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {info.label}
          </div>
          <p className="text-[11px] opacity-75">Compatibility Index</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold tracking-wide ${info.bg} ${className}`}
    >
      <span className="font-bold">{score}%</span>
      {showLabel && (
        <span className="text-[11px] opacity-80 font-medium">
          • {info.label}
        </span>
      )}
    </div>
  );
}

export default ScoreBadge;
