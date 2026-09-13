import { Home, Search, Bell, Mail, User, LogOut, MoreHorizontal } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { LinkupLogo } from '../ui/LinkupLogo';
import { ThemeToggle } from '../ui/ThemeToggle';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Search },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'profile', label: 'Profile', icon: User },
];

function NavItem({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-3 rounded-full transition-colors ${
        isActive
          ? 'font-bold text-primary bg-primary-fixed/60 dark:text-white dark:bg-primary-container'
          : 'text-on-surface-variant hover:bg-surface-container dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={22} className={isActive ? 'text-primary dark:text-primary-fixed' : 'text-outline dark:text-slate-400'} />
      <span className="text-lg hidden xl:block">{label}</span>
    </button>
  );
}

export function LeftSidebar({ activeTab, setActiveTab, currentUser, onLogout }) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:items-end lg:pr-8 lg:py-6 lg:h-screen lg:sticky lg:top-0 lg:w-72">
      <div className="w-full max-w-[240px] flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 mb-8">
          <LinkupLogo size={44} />
          <span className="font-bold text-xl text-on-surface dark:text-slate-100 tracking-editorial hidden xl:block">Linkup</span>
        </div>

        <nav className="flex-1 space-y-2 px-2 lg:px-0">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}

          <div className="pt-4 mt-4 border-t border-outline-variant/40 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-4 p-3 xl:justify-start justify-center">
              <ThemeToggle />
              <span className="text-sm text-on-surface-variant dark:text-slate-400 hidden xl:block">Toggle theme</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-4 w-full p-3 text-error hover:bg-error-container/50 dark:hover:bg-red-950/40 rounded-full"
            >
              <LogOut size={22} />
              <span className="text-lg hidden xl:block">Logout</span>
            </button>
          </div>
        </nav>

        <div className="flex items-center gap-3 p-3 rounded-full hover:bg-surface-container-lowest hover:shadow-glass dark:hover:bg-slate-800 transition-all cursor-pointer mt-auto bg-surface-container-low dark:bg-slate-800/50">
          <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
          <div className="flex-1 min-w-0 hidden xl:block">
            <p className="text-sm font-bold text-on-surface dark:text-slate-100 truncate">{currentUser.name}</p>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 truncate">{currentUser.handle}</p>
          </div>
          <MoreHorizontal size={16} className="text-outline hidden xl:block" />
        </div>
      </div>
    </aside>
  );
}

export { NAV_ITEMS };
