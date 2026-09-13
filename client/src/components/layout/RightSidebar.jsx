import { Search, MoreHorizontal } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export function RightSidebar({
  searchQuery,
  setSearchQuery,
  onSearch,
  onSelectHashtag,
  onSelectExplore,
  trendingHashtags,
  suggestedUsers,
  following,
  onToggleFollow,
}) {
  return (
    <aside className="hidden lg:block w-[350px] pl-8 py-6 space-y-6">
      <div className="sticky top-0 z-10 pb-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400 group-focus-within:text-blue-500" />
          </div>
          <input
            type="text"
            placeholder="Search Linkup"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSelectExplore();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSelectExplore();
                onSearch();
              }
            }}
            className="block w-full pl-10 pr-3 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Trends for you</h2>
        </div>
        {trendingHashtags.length > 0 ? (
          trendingHashtags.map((trend, i) => (
            <button
              key={i}
              onClick={() => onSelectHashtag(trend.hashtag)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Trending in Linkup</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">#{trend.hashtag}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{trend.count} posts</p>
                </div>
                <MoreHorizontal size={16} className="text-slate-400" />
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
            <p>No trending hashtags yet</p>
            <p className="text-sm mt-1">Be the first to post with hashtags!</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Who to follow</h2>
        </div>
        {suggestedUsers.length > 0 ? (
          suggestedUsers.map((u) => (
            <div key={u._id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-3">
              <Avatar src={`https://i.pravatar.cc/150?u=${u._id}`} alt={u.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{u.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{u.email.split('@')[0]}</p>
              </div>
              <Button variant="secondary" className="px-3 py-1 text-sm h-8" onClick={() => onToggleFollow(u._id)}>
                {following.has(u._id) ? 'Following' : 'Follow'}
              </Button>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
            <p>No suggestions available</p>
            <p className="text-sm mt-1">More users will appear as they join!</p>
          </div>
        )}
      </div>

      <div className="px-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 dark:text-slate-500">
        <a href="#" className="hover:underline">Terms</a>
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Cookies</a>
        <span>© 2026 Linkup Inc.</span>
      </div>
    </aside>
  );
}
