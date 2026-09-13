import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { LinkupLogo } from '../ui/LinkupLogo';
import { ProfileDropdown } from './ProfileDropdown';

const NAV_TABS = [
  { id: 'home', label: 'Feed' },
  { id: 'explore', label: 'Explore' },
];

export function TopNav({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState('');

  useEffect(() => {
    if (location.pathname === '/search') {
      const q = new URLSearchParams(location.search).get('q') || '';
      setLocalQuery(q);
    }
  }, [location.pathname, location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = localQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const clickTab = (id) => {
    if (id === 'explore') {
      navigate('/search');
      return;
    }
    setActiveTab(id);
    if (location.pathname !== '/') navigate('/');
  };

  const onSearchRoute = location.pathname === '/search';
  const effectiveTab = onSearchRoute ? 'explore' : activeTab;

  return (
    <header className="sticky top-0 z-40 glass-panel">
      <div className="max-w-[1400px] mx-auto flex items-center gap-4 px-4 sm:px-6 h-16">
        <Link
          to="/"
          className="flex items-center gap-2 flex-shrink-0"
          onClick={() => setActiveTab('home')}
        >
          <LinkupLogo size={30} />
          <span className="font-bold text-lg text-primary-container tracking-editorial hidden sm:inline">
            Linkup
          </span>
        </Link>

        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
              <Search size={18} strokeWidth={1.75} />
            </div>
            <input
              type="search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search posts and people…"
              className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/50 text-on-surface text-sm placeholder:text-outline focus:bg-surface-container-lowest focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all"
            />
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_TABS.map((tab) => {
            const active = effectiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => clickTab(tab.id)}
                className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  active
                    ? 'text-primary bg-primary-fixed/60'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('home');
              if (location.pathname !== '/') navigate('/');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 pl-3 pr-4 py-2 rounded-full bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors subtle-wine-halo active:translate-y-[1px]"
          >
            <Plus size={16} strokeWidth={2} />
            <span>Create Post</span>
          </button>
          <ProfileDropdown
            currentUser={currentUser}
            activeTab={effectiveTab}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
          />
        </div>
      </div>

      <div className="md:hidden border-t border-outline-variant/40 px-2">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          {NAV_TABS.map((tab) => {
            const active = effectiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => clickTab(tab.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  active
                    ? 'text-primary bg-primary-fixed/60'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
