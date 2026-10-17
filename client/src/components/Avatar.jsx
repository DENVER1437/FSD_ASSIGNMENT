import { useState } from 'react';

/**
 * Reusable Avatar Component
 * Displays profile image with graceful initials fallback.
 */
export function Avatar({
  src,
  name = 'User',
  size = 'md',
  className = '',
  status,
}) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
    '2xl': 'w-28 h-28 text-2xl font-bold',
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={`rounded-full object-cover border border-stone-200/80 shadow-sm ${sizes[size] || sizes.md}`}
        />
      ) : (
        <div
          className={`rounded-full bg-brand-100 text-brand-800 flex items-center justify-center border border-brand-200 font-medium ${
            sizes[size] || sizes.md
          }`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${
            size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          } ${status === 'online' ? 'bg-emerald-500' : 'bg-stone-300'}`}
        />
      )}
    </div>
  );
}

export default Avatar;
