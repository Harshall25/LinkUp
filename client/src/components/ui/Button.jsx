const variants = {
  primary:
    'bg-primary-container hover:bg-primary text-on-primary subtle-wine-halo disabled:opacity-60 disabled:cursor-not-allowed',
  secondary:
    'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-secondary-fixed',
  ghost:
    'hover:bg-surface-container text-on-surface-variant',
  danger: 'text-error hover:bg-error-container/60',
};

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'px-4 py-2 rounded-full font-semibold text-sm transition-colors active:translate-y-[1px] flex items-center justify-center gap-2';
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
