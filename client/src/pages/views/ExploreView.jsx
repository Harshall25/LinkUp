import { Search, Loader2 } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { PostCard } from '../../components/post/PostCard';

export function ExploreView({
  searchQuery,
  setSearchQuery,
  onSearch,
  searchResults,
  isSearching,
  onLike,
  likedPosts,
  onSelectHashtag,
}) {
  return (
    <div>
      <div className="sticky top-14 lg:top-0 glass-panel z-30 px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Search posts, users, or hashtags..."
              className="block w-full pl-10 pr-12 py-3 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button
              onClick={onSearch}
              disabled={isSearching}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500 hover:text-blue-600 disabled:opacity-50"
            >
              {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : searchQuery && (searchResults.posts.length > 0 || searchResults.users.length > 0) ? (
          <div className="space-y-6">
            {searchResults.users.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Users</h3>
                <div className="space-y-3">
                  {searchResults.users.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <Avatar src={null} alt={u.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{u.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">@{u.email.split('@')[0]}</p>
                      </div>
                      <Button variant="secondary" className="px-4 py-1 text-sm">
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.posts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Posts</h3>
                <div className="space-y-4">
                  {searchResults.posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onLike={() => onLike(post._id)}
                      isLiked={likedPosts.has(post._id)}
                      onSelectHashtag={onSelectHashtag}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No results found for "{searchQuery}"</p>
            <p className="text-slate-400 text-sm mt-2">Try searching for different keywords</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Search for posts, topics, or users</p>
            <p className="text-slate-400 text-sm mt-2">Start typing to see results</p>
          </div>
        )}
      </div>
    </div>
  );
}
