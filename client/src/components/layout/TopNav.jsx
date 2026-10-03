import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { LinkupLogo } from '../ui/LinkupLogo';
import { ProfileDropdown } from './ProfileDropdown';
import { CONTAINER } from './container';

const NAV_LINKS = [
  { to: '/', label: 'Feed', end: true },
  { to: '/search', label: 'Explore' },
];

const pillClass = ({ isActive }) =>
  `shrink-0 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
    isActive
      ? 'text-primary bg-primary-fixed/60'
      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
  }`;

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onSearch = location.pathname === '/search';
    setQuery(onSearch ? new URLSearchParams(location.search).get('q') || '' : '');
  }, [location.pathname, location.search]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  // The feed page focuses the composer whenever this state changes.
  const compose = () => navigate('/', { state: { compose: Date.now() } });

  return (
    <header className="sticky top-0 z-40 glass-panel">
      <div className={`${CONTAINER} h-16 flex items-center gap-3 sm:gap-6`}>
        <Link to="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Linkup home">
          <LinkupLogo size={30} />
          <span className="hidden sm:inline font-bold text-xl text-primary-container tracking-editorial">
            Linkup
          </span>
        </Link>

        <form role="search" onSubmit={submit} className="flex-1 min-w-0 max-w-xl mx-auto">
          <label className="relative block">
            <span className="sr-only">Search posts, people and #hashtags</span>
            <Search
              size={18}
              strokeWidth={1.75}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, people, #tags"
              className="block w-full h-10 pl-11 pr-4 rounded-full bg-surface-container-low border border-outline-variant/60 text-on-surface text-sm placeholder:text-outline focus:bg-surface-container-lowest focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all"
            />
          </label>
        </form>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={pillClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={compose}
            className="hidden sm:inline-flex items-center gap-1.5 h-10 pl-3.5 pr-4 rounded-full bg-primary-container text-on-primary text-sm font-semibold hover:bg-[#C4694B] transition-colors subtle-wine-halo active:translate-y-[1px]"
          >
            <Plus size={16} strokeWidth={2.25} />
            Create post
          </button>
          <button
            type="button"
            onClick={compose}
            aria-label="Create post"
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-container text-on-primary hover:bg-[#C4694B] transition-colors"
          >
            <Plus size={18} strokeWidth={2.25} />
          </button>
          <ProfileDropdown />
        </div>
      </div>

      <nav className="md:hidden border-t border-outline-variant/40" aria-label="Primary">
        <div className={`${CONTAINER} flex items-center gap-1 py-1.5`}>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={pillClass}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
