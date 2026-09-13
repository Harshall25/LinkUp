const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-24 h-24 text-4xl',
};

export function Avatar({ src, alt, size = 'md' }) {
  const fallback = alt ? alt.charAt(0).toUpperCase() : 'L';
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover border border-outline-variant/40 bg-surface-container flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-primary-fixed font-bold flex-shrink-0`}
    >
      {fallback}
    </div>
  );
}
