export function ActionIcon({ icon: Icon, count, isActive, onClick, color, fill }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 group transition-colors ${
        isActive ? '' : 'text-on-surface-variant'
      }`}
    >
      <span className={`p-2 rounded-full transition-colors ${color}`}>
        <Icon size={18} strokeWidth={1.75} className={fill ? 'fill-current' : ''} />
      </span>
      {count !== undefined && (
        <span
          className={`text-xs font-medium ${
            color && !color.includes('hover') ? color : 'group-hover:text-on-surface'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
