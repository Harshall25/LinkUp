import { TopNav } from './TopNav';
import { TrendingRail } from './TrendingRail';
import { CONTAINER } from './container';

export function AppShell({ children, railRefreshKey }) {
  return (
    <div className="min-h-[100dvh] bg-surface text-on-surface">
      <TopNav />
      <div className={`${CONTAINER} py-6`}>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <main className="min-w-0 self-start rounded-3xl bg-surface-container-lowest border border-outline-variant/50 overflow-clip">
            {children}
          </main>
          <aside className="min-w-0 hidden lg:block" aria-label="Trending and suggestions">
            <TrendingRail refreshKey={railRefreshKey} />
          </aside>
        </div>
      </div>
    </div>
  );
}
