/**
 * Reusable Card Component
 * Provides clean surface background with fine border and subtle shadow.
 */
export function Card({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-stone-200/90 shadow-subtle ${
        hover
          ? 'hover:shadow-cardHover hover:border-stone-300 transition-all duration-200 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
