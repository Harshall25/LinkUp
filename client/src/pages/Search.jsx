import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { PostCard } from '../components/post/PostCard';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../api/posts';
import { usersAPI } from '../api/users';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'people', label: 'People' },
];

function FilterTabs({ active, setActive, counts }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      {FILTER_TABS.map((tab) => {
        const isActive = active === tab.id;
        const count = counts[tab.id];
        return (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-primary-container text-on-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {tab.label}
            {typeof count === 'number' && <span className={`ml-1.5 ${isActive ? 'opacity-80' : 'text-outline'}`}>({count})</span>}
          </button>
        );
      })}
    </div>
  );
}

function UserResultRow({ user, following, onToggleFollow }) {
  const handle = user.email ? `@${user.email.split('@')[0]}` : '@member';
  const isFollowing = following.has(user._id);
  return (
    <li className="p-5 flex items-center gap-3 hover:bg-surface-container-low transition-colors">
      <Avatar src={`https://i.pravatar.cc/80?u=${user._id}`} alt={user.name} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-on-surface truncate">{user.name}</p>
        <p className="text-xs text-on-surface-variant truncate">{handle}</p>
      </div>
      <Button
        variant={isFollowing ? 'secondary' : 'primary'}
        className="px-4 py-1.5 text-xs"
        onClick={() => onToggleFollow(user._id)}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </li>
  );
}

export default function Search() {
  const [params, setSearchParams] = useSearchParams();
  const query = params.get('q') || '';
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('explore');
  const [activeFilter, setActiveFilter] = useState('all');
  const [postResults, setPostResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [following, setFollowing] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const CURRENT_USER = useMemo(
    () => ({
      id: user?.id || 'u1',
      name: user?.name || 'Member',
      handle: `@${user?.email?.split('@')[0] || 'member'}`,
      avatar: null,
    }),
    [user]
  );

  useEffect(() => {
    if (activeTab === 'home') navigate('/');
    if (activeTab === 'profile') navigate('/?tab=profile');
  }, [activeTab, navigate]);

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setPostResults([]);
      setUserResults([]);
      return;
    }
    setLoading(true);
    try {
      const [postsRes, usersRes] = await Promise.all([
        postsAPI.searchPosts(q).catch(() => ({ posts: [] })),
        usersAPI.searchUsers(q).catch(() => ({ users: [] })),
      ]);
      setPostResults(postsRes.posts || []);
      setUserResults(usersRes.users || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(query);
  }, [query, runSearch]);

  const handleSelectHashtag = (tag) => {
    setSearchParams({ q: `#${tag}` });
  };

  const handleLike = async (postId) => {
    try {
      const isLiked = likedPosts.has(postId);
      if (isLiked) {
        await postsAPI.unlikePost(postId);
        setLikedPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setPostResults((current) =>
          current.map((p) =>
            p._id === postId ? { ...p, likesCount: Math.max(0, p.likesCount - 1) } : p
          )
        );
      } else {
        await postsAPI.likePost(postId);
        setLikedPosts((prev) => new Set(prev).add(postId));
        setPostResults((current) =>
          current.map((p) => (p._id === postId ? { ...p, likesCount: p.likesCount + 1 } : p))
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleToggleFollow = async (userId) => {
    try {
      if (following.has(userId)) {
        await usersAPI.unfollowUser(userId);
        setFollowing((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await usersAPI.followUser(userId);
        setFollowing((prev) => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showPosts = activeFilter === 'all' || activeFilter === 'posts';
  const showPeople = activeFilter === 'all' || activeFilter === 'people';
  const total = postResults.length + userResults.length;

  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUser={CURRENT_USER}
      onLogout={handleLogout}
      hideRail
    >
      <div className="p-5 sm:p-6">
        <header className="pb-4 border-b border-outline-variant/40">
          <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant font-semibold">
            Search results
          </p>
          <h1 className="mt-1 text-2xl sm:text-[28px] leading-9 font-bold text-on-surface tracking-editorial">
            {query ? (
              <>Results for <span className="text-primary-container">&ldquo;{query}&rdquo;</span></>
            ) : (
              'Start typing to search'
            )}
          </h1>
          {query && !loading && (
            <p className="mt-1 text-sm text-on-surface-variant">
              {total} {total === 1 ? 'match' : 'matches'} found
            </p>
          )}
        </header>

        <div className="mt-4">
          <FilterTabs
            active={activeFilter}
            setActive={setActiveFilter}
            counts={{
              all: total,
              posts: postResults.length,
              people: userResults.length,
            }}
          />
        </div>

        <div className="mt-6">
          {!query ? (
            <EmptySearchState />
          ) : loading ? (
            <LoadingState />
          ) : total === 0 ? (
            <NoResultsState query={query} />
          ) : (
            <div className="space-y-6">
              {showPeople && userResults.length > 0 && (
                <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden">
                  <header className="px-5 py-4 border-b border-outline-variant/40">
                    <h2 className="font-semibold text-on-surface tracking-editorial">
                      People &bull; {userResults.length}
                    </h2>
                  </header>
                  <ul className="divide-y divide-outline-variant/30">
                    {userResults.map((u) => (
                      <UserResultRow
                        key={u._id}
                        user={u}
                        following={following}
                        onToggleFollow={handleToggleFollow}
                      />
                    ))}
                  </ul>
                </section>
              )}

              {showPosts && postResults.length > 0 && (
                <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden">
                  <header className="px-5 py-4 border-b border-outline-variant/40">
                    <h2 className="font-semibold text-on-surface tracking-editorial">
                      Posts &bull; {postResults.length}
                    </h2>
                  </header>
                  <div className="divide-y divide-outline-variant/30">
                    {postResults.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onLike={() => handleLike(post._id)}
                        isLiked={likedPosts.has(post._id)}
                        onSelectHashtag={handleSelectHashtag}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function EmptySearchState() {
  return (
    <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/40 px-6 py-16 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-primary-fixed/60 flex items-center justify-center text-primary">
        <SearchIcon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 font-semibold text-on-surface tracking-editorial">
        Search posts and people.
      </h3>
      <p className="mt-1 text-sm text-on-surface-variant">
        Use the search box in the top bar to start.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={28} className="animate-spin text-primary-container" />
    </div>
  );
}

function NoResultsState({ query }) {
  return (
    <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/40 px-6 py-16 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
        <SearchIcon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 font-semibold text-on-surface tracking-editorial">
        No matches for &ldquo;{query}&rdquo;
      </h3>
      <p className="mt-1 text-sm text-on-surface-variant">
        Try a different keyword or hashtag.
      </p>
    </div>
  );
}
