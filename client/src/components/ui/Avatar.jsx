import { useEffect, useState } from 'react';

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-24 h-24 text-4xl',
};

export function Avatar({ src, alt, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const base = `${sizes[size]} rounded-full flex-shrink-0`;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        // Google profile photos refuse requests that carry a cross-site referrer.
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${base} object-cover bg-surface-container`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`${base} bg-gradient-to-br from-primary-container to-[#B65E42] flex items-center justify-center text-white font-semibold select-none`}
    >
      {alt ? alt.trim().charAt(0).toUpperCase() : 'L'}
    </div>
  );
}
