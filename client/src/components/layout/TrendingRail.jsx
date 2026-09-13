import { TrendingUp } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export function TrendingRail({
  onSelectHashtag,
  trendingHashtags = [],
  suggestedUsers = [],
  following = new Set(),
  onToggleFollow,
}) {
  const hasTrending = trendingHashtags.length > 0;
  const hasSuggested = suggestedUsers.length > 0;

  if (!hasTrending && !hasSuggested) return null;

  return (
    <div className="space-y-5 lg:sticky lg:top-24">
      {hasTrending && (
        <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden">
          <header className="px-5 py-4 flex items-center gap-2 border-b border-outline-variant/40">
            <TrendingUp size={18} strokeWidth={1.75} className="text-primary" />
            <h2 className="font-semibold text-on-surface tracking-editorial">Trending</h2>
          </header>
          <ul className="divide-y divide-outline-variant/30">
            {trendingHashtags.map((trend, i) => (
              <li key={`${trend.hashtag}-${i}`}>
                <button
                  onClick={() => onSelectHashtag?.(trend.hashtag)}
                  className="w-full text-left px-5 py-3 hover:bg-surface-container transition-colors"
                >
                  <p className="font-semibold text-on-surface">#{trend.hashtag}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{trend.count} posts</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasSuggested && (
        <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden">
          <header className="px-5 py-4 border-b border-outline-variant/40">
            <h2 className="font-semibold text-on-surface tracking-editorial">Who to follow</h2>
          </header>
          <ul className="divide-y divide-outline-variant/30">
            {suggestedUsers.map((u) => (
              <li key={u._id} className="px-5 py-3 hover:bg-surface-container transition-colors flex items-center gap-3">
                <Avatar src={`https://i.pravatar.cc/150?u=${u._id}`} alt={u.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface truncate">{u.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">@{u.email.split('@')[0]}</p>
                </div>
                <Button
                  variant={following.has(u._id) ? 'secondary' : 'primary'}
                  className="px-3.5 py-1 text-xs h-8"
                  onClick={() => onToggleFollow?.(u._id)}
                >
                  {following.has(u._id) ? 'Following' : 'Follow'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
