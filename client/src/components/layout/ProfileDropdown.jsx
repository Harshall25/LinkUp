import { useEffect, useRef, useState } from 'react';
import { Home, Compass, User, Moon, Sun, LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '../../context/ThemeContext';

const OPEN_DELAY = 60;
const CLOSE_DELAY = 180;

export function ProfileDropdown({ currentUser, activeTab, setActiveTab, onLogout }) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const closeTimer = useRef(null);
  const openTimer = useRef(null);

  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
  }, []);

  const handleEnter = () => {
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  };
  const handleLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  const go = (tab) => {
    setActiveTab(tab);
    setOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container/30"
      >
        <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-glass-lg overflow-hidden z-50 origin-top-right"
          style={{ animation: 'popin 160ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className="p-4 border-b border-outline-variant/40 flex items-center gap-3">
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-on-surface truncate">{currentUser.name}</p>
              <p className="text-xs text-on-surface-variant truncate">{currentUser.handle}</p>
            </div>
          </div>
          <div className="p-2">
            <MenuItem icon={Home} label="Home" active={activeTab === 'home'} onClick={() => go('home')} />
            <MenuItem icon={Compass} label="Explore" active={activeTab === 'explore'} onClick={() => go('explore')} />
            <MenuItem icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => go('profile')} />
          </div>
          <div className="border-t border-outline-variant/40 p-2">
            <MenuItem
              icon={isDark ? Sun : Moon}
              label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
            />
            <MenuItem icon={LogOut} label="Sign out" danger onClick={onLogout} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes popin {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

function MenuItem({ icon: Icon, label, active, danger, onClick }) {
  const base = 'flex items-center gap-3 w-full px-3 py-2 rounded-full text-sm text-left transition-colors';
  const tone = danger
    ? 'text-error hover:bg-error-container/50'
    : active
      ? 'text-primary bg-primary-fixed/50 font-semibold'
      : 'text-on-surface hover:bg-surface-container';
  return (
    <button role="menuitem" onClick={onClick} className={`${base} ${tone}`}>
      <Icon size={18} strokeWidth={1.75} />
      <span>{label}</span>
    </button>
  );
}
