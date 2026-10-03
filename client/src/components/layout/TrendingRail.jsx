import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { FollowButton } from '../ui/FollowButton';
import { postsAPI } from '../../api/posts';
import { usersAPI } from '../../api/users';
import { handleOf, hashtagPath, pluralize } from '../../utils/format';

function useActiveHashtag() {
  const { pathname, search } = useLocation();
  if (pathname !== '/search') return null;
  const q = new URLSearchParams(search).get('q') || '';
  return q.startsWith('#') ? q.slice(1).toLowerCase() : null;
}

export function TrendingRail({ refreshKey }) {
  const activeTag = useActiveHashtag();
  const [trending, setTrending] = useState(null);
  const [suggested, setSuggested] = useState(null);

  useEffect(() => {
    let active = true;
    postsAPI
      .getTrendingHashtags(8)
      .then((res) => active && setTrending(res.trending || []))
      .catch(() => active && setTrending([]));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let active = true;
    usersAPI
      .getSuggestedUsers()
      .then((res) => active && setSuggested(res.users || []))
      .catch(() => active && setSuggested([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-5 lg:sticky lg:top-[5.5rem] lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto no-scrollbar">
      <RailCard icon={TrendingUp} title="Trending">
        {trending === null ? (
          <RailSkeleton />
        ) : trending.length === 0 ? (
          <p className="px-5 py-4 text-sm text-on-surface-variant">
            No topics yet. Add a #hashtag to your post to start one.
          </p>
        ) : (
          <ol className="py-1.5">
            {trending.map((trend, i) => {
              const isActive = activeTag === trend.hashtag.toLowerCase();
              return (
                <li key={trend.hashtag}>
                  <Link
                    to={hashtagPath(trend.hashtag)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 px-5 py-2.5 transition-colors ${
                      isActive ? 'bg-primary-fixed/50' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="w-4 text-xs font-semibold text-outline tabular-nums">{i + 1}</span>
                    <span className="min-w-0">
                      <span className={`block font-semibold truncate ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                        #{trend.hashtag}
                      </span>
                      <span className="block text-xs text-on-surface-variant">{pluralize(trend.count, 'post')}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </RailCard>

      {suggested?.length > 0 && (
        <RailCard title="Who to follow">
          <ul className="py-1.5">
            {suggested.map((u) => (
              <li key={u._id} className="px-5 py-2.5 flex items-center gap-3">
                <Avatar src={u.avatar} alt={u.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface truncate">{u.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{handleOf(u)}</p>
                </div>
                <FollowButton userId={u._id} />
              </li>
            ))}
          </ul>
        </RailCard>
      )}

      <p className="px-2 text-xs text-outline">© {new Date().getFullYear()} Linkup</p>
    </div>
  );
}

function RailCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/50 overflow-hidden">
      <header className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-outline-variant/40">
        {Icon && <Icon size={18} strokeWidth={1.75} className="text-primary" />}
        <h2 className="font-semibold text-on-surface tracking-editorial">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function RailSkeleton() {
  return (
    <div className="py-1.5 animate-pulse" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="px-5 py-3 space-y-2">
          <div className="h-3 rounded-full bg-surface-container w-2/5" />
          <div className="h-2.5 rounded-full bg-surface-container w-1/4" />
        </div>
      ))}
    </div>
  );
}
