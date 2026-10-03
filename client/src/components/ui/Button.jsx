const variants = {
  primary:
    'bg-primary-container hover:bg-[#C4694B] text-on-primary subtle-wine-halo',
  secondary:
    'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-outline-variant',
  ghost:
    'hover:bg-surface-container text-on-surface-variant',
  danger: 'bg-error text-on-error hover:opacity-90',
};

export function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  const base =
    'px-4 py-2 rounded-full font-semibold text-sm transition-colors active:translate-y-[1px] inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0';
  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
