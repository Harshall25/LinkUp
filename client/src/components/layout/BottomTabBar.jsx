import { NAV_ITEMS } from './LeftSidebar';

export function BottomTabBar({ activeTab, setActiveTab }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-around px-2 py-1 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
