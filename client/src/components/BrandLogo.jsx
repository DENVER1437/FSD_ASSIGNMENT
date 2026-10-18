/**
 * NestMatch Official Brand Logo Component
 *
 * Displays the verified official NestMatch brand logo featuring the modern house
 * icon with two roommates, chimney leaf accent, and brand wordmark.
 *
 * Variants:
 *  - 'horizontal': Horizontal brand lockup (emblem + wordmark + tagline). Perfect for navigation headers.
 *  - 'icon': Emblem-only (house + roommates + leaf). Perfect for compact icons, sidebars, and mobile headers.
 *  - 'full': Stacked square logo (emblem on top, wordmark and tagline below). Perfect for auth pages and footers.
 */

export function BrandLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  alt = 'NestMatch — Smart Roommate Compatibility Finder',
  priority = false,
  ...props
}) {
  const assetPaths = {
    full: '/images/nestmatch-logo.png',
    horizontal: '/images/nestmatch-logo-horizontal.png',
    icon: '/images/nestmatch-icon.png',
  };

  const src = assetPaths[variant] || assetPaths.horizontal;

  // Preset size styles per variant to prevent layout shift and maintain aspect ratios
  const sizeClasses = {
    horizontal: {
      sm: 'h-8 w-auto max-w-[140px]',
      md: 'h-10 w-auto max-w-[180px]',
      lg: 'h-12 w-auto max-w-[220px]',
      xl: 'h-16 w-auto max-w-[280px]',
    },
    icon: {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
      '2xl': 'w-20 h-20',
    },
    full: {
      sm: 'w-20 h-20',
      md: 'w-28 h-28',
      lg: 'w-36 h-36',
      xl: 'w-48 h-48',
      '2xl': 'w-56 h-56',
    },
  };

  const currentVariantSizes = sizeClasses[variant] || sizeClasses.horizontal;
  const dimensionClass = currentVariantSizes[size] || currentVariantSizes.md;

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`shrink-0 object-contain select-none transition-transform duration-200 ${dimensionClass} ${className}`}
      {...props}
    />
  );
}

export default BrandLogo;
