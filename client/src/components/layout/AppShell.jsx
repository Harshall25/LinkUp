import { TopNav } from './TopNav';
import { TrendingRail } from './TrendingRail';

export function AppShell({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  rightSidebarProps,
  hideRail = false,
  children,
}) {
  const railHasContent =
    !!rightSidebarProps &&
    ((rightSidebarProps.trendingHashtags?.length ?? 0) > 0 ||
      (rightSidebarProps.suggestedUsers?.length ?? 0) > 0);

  const showRail = !hideRail && railHasContent;

  return (
    <div className="min-h-[100dvh] bg-surface dark:bg-tertiary text-on-surface dark:text-inverse-on-surface">
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div
          className={`grid gap-6 ${
            showRail ? 'grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]' : 'grid-cols-1'
          }`}
        >
          <main className="min-w-0 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden">
            {children}
          </main>
          {showRail && (
            <aside className="min-w-0 hidden lg:block">
              <TrendingRail {...rightSidebarProps} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
