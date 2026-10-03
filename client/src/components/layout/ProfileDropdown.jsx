import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Compass, Home, LogOut, Moon, Sun, User } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { handleOf } from '../../utils/format';

const OPEN_DELAY = 60;
const CLOSE_DELAY = 180;

const LINKS = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/search', label: 'Explore', icon: Compass },
  { to: '/profile', label: 'Your profile', icon: User },
];

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const timer = useRef(null);
  const lastPointer = useRef('mouse');

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const schedule = (next, delay) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  };

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  const signOut = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const name = user?.name || 'Member';
  const isDark = theme === 'dark';

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && schedule(true, OPEN_DELAY)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && schedule(false, CLOSE_DELAY)}
    >
      <button
        type="button"
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onClick={(e) => {
          clearTimeout(timer.current);
          // Hover already opened it for mouse users; a click shouldn't close it again.
          const isMouseClick = e.detail > 0 && lastPointer.current === 'mouse';
          setOpen((v) => (isMouseClick ? true : !v));
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1 p-1 sm:pr-2 rounded-full hover:bg-surface-container transition-colors"
      >
        <Avatar src={user?.avatar} alt={name} size="sm" />
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`hidden sm:block text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-popin absolute right-0 mt-2 w-64 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-glass-lg overflow-hidden z-50 origin-top-right"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => go('/profile')}
            className="w-full p-4 border-b border-outline-variant/40 flex items-center gap-3 text-left hover:bg-surface-container-low transition-colors"
          >
            <Avatar src={user?.avatar} alt={name} size="md" />
            <span className="min-w-0">
              <span className="block font-semibold text-sm text-on-surface truncate">{name}</span>
              <span className="block text-xs text-on-surface-variant truncate">{handleOf(user)}</span>
            </span>
          </button>
          <div className="p-2">
            {LINKS.map(({ to, label, icon }) => (
              <MenuItem key={to} icon={icon} label={label} active={pathname === to} onClick={() => go(to)} />
            ))}
          </div>
          <div className="border-t border-outline-variant/40 p-2">
            <MenuItem
              icon={isDark ? Sun : Moon}
              label={isDark ? 'Light mode' : 'Dark mode'}
              onClick={toggleTheme}
            />
            <MenuItem icon={LogOut} label="Sign out" danger onClick={signOut} />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, active, danger, onClick }) {
  const tone = danger
    ? 'text-error hover:bg-error-container/50'
    : active
      ? 'text-primary bg-primary-fixed/50 font-semibold'
      : 'text-on-surface hover:bg-surface-container';
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-left transition-colors ${tone}`}
    >
      <Icon size={18} strokeWidth={1.75} />
      <span>{label}</span>
    </button>
  );
}
