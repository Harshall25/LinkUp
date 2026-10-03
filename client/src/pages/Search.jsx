import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Hash, Search as SearchIcon } from 'lucide-react';
import { usersAPI } from '../api/users';
import { usePostFeed } from '../hooks/usePostFeed';
import { AppShell } from '../components/layout/AppShell';
import { Avatar } from '../components/ui/Avatar';
import { FollowButton } from '../components/ui/FollowButton';
import { EmptyState, PostList } from '../components/post/PostList';
import { handleOf, pluralize } from '../utils/format';

function parseQuery(raw) {
  const q = (raw || '').trim();
  const tag = q.startsWith('#') ? q.replace(/^#+/, '').trim() : '';
  if (!q) return { mode: 'explore', q, feedParams: { sortBy: 'likesCount' } };
  if (tag) return { mode: 'tag', q, tag, feedParams: { tags: tag } };
  return { mode: 'search', q, feedParams: { search: q } };
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const { mode, q, tag, feedParams } = parseQuery(params.get('q'));
  const feed = usePostFeed(feedParams);
  const people = usePeopleSearch(mode === 'search' ? q : '');
  const [filter, setFilter] = useState('all');

  useEffect(() => setFilter('all'), [q]);

  return (
    <AppShell>
      <header className="px-5 sm:px-6 pt-6 pb-4 border-b border-outline-variant/40">
        {mode === 'explore' && (
          <PageHeading icon={Compass} eyebrow="Explore" title="Popular on Linkup" />
        )}
        {mode === 'tag' && (
          <PageHeading
            icon={Hash}
            eyebrow="Topic"
            title={`#${tag}`}
            meta={feed.status === 'ready' ? pluralize(feed.total, 'post') : null}
          />
        )}
        {mode === 'search' && (
          <>
            <PageHeading
              icon={SearchIcon}
              eyebrow="Search"
              title={
                <>
                  Results for <span className="text-primary-container">&ldquo;{q}&rdquo;</span>
                </>
              }
            />
            <FilterTabs
              active={filter}
              onChange={setFilter}
              counts={{ posts: feed.status === 'ready' ? feed.total : null, people: people.users?.length ?? null }}
            />
          </>
        )}
      </header>

      {mode === 'search' ? (
        <SearchResults q={q} filter={filter} feed={feed} people={people} />
      ) : (
        <PostList
          feed={feed}
          emptyState={
            mode === 'tag' ? (
              <EmptyState icon={Hash} title={`No posts tagged #${tag}`} description="Try another topic from the trending list." />
            ) : (
              <EmptyState icon={Compass} title="Nothing to explore yet" description="Posts from across Linkup will appear here." />
            )
          }
        />
      )}
    </AppShell>
  );
}

function usePeopleSearch(q) {
  const [state, setState] = useState({ q: '', users: null });

  useEffect(() => {
    if (q.length < 2) {
      setState({ q, users: [] });
      return;
    }
    let active = true;
    setState({ q, users: null });
    usersAPI
      .searchUsers(q)
      .then((res) => active && setState({ q, users: res.users || [] }))
      .catch(() => active && setState({ q, users: [] }));
    return () => {
      active = false;
    };
  }, [q]);

  return state;
}

function SearchResults({ q, filter, feed, people }) {
  const peopleLoading = people.users === null;
  const showPeople = filter !== 'posts' && !peopleLoading && people.users.length > 0;
  const showPosts = filter !== 'people';
  const noResults =
    feed.status === 'ready' && feed.posts.length === 0 && !peopleLoading && people.users.length === 0;

  if (noResults) {
    return (
      <EmptyState
        icon={SearchIcon}
        title={`No results for “${q}”`}
        description="Check the spelling or try a different keyword or #hashtag."
      />
    );
  }

  if (filter === 'people' && !peopleLoading && people.users.length === 0) {
    return <EmptyState icon={SearchIcon} title="No people found" description={`Nobody matches “${q}”.`} />;
  }

  return (
    <>
      {showPeople && (
        <section aria-label="People" className="border-b border-outline-variant/40">
          <SectionLabel>People</SectionLabel>
          <ul>
            {people.users.map((u) => (
              <li key={u._id} className="px-5 sm:px-6 py-3 flex items-center gap-3">
                <Avatar src={u.avatar} alt={u.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface truncate">{u.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{handleOf(u)}</p>
                </div>
                {u.isSelf ? (
                  <span className="text-xs font-semibold text-on-surface-variant px-3">You</span>
                ) : (
                  <FollowButton userId={u._id} initialFollowing={u.isFollowing} />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {showPosts && (
        <section aria-label="Posts">
          {showPeople && feed.posts.length > 0 && <SectionLabel>Posts</SectionLabel>}
          <PostList
            feed={feed}
            emptyState={
              showPeople ? null : (
                <EmptyState icon={SearchIcon} title="No posts found" description={`No posts mention “${q}”.`} />
              )
            }
          />
        </section>
      )}
    </>
  );
}

function PageHeading({ icon: Icon, eyebrow, title, meta }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-primary-fixed/60 text-primary flex items-center justify-center flex-shrink-0">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant font-semibold">{eyebrow}</p>
        <h1 className="text-2xl font-bold text-on-surface tracking-editorial truncate">{title}</h1>
        {meta && <p className="text-sm text-on-surface-variant">{meta}</p>}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <h2 className="px-5 sm:px-6 pt-4 pb-1 text-xs uppercase tracking-[0.14em] font-semibold text-on-surface-variant">
      {children}
    </h2>
  );
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'people', label: 'People' },
];

function FilterTabs({ active, onChange, counts }) {
  return (
    <div role="tablist" aria-label="Result type" className="mt-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
      {FILTERS.map((tab) => {
        const isActive = active === tab.id;
        const count = counts[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-primary-container text-on-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {tab.label}
            {typeof count === 'number' && (
              <span className={`ml-1.5 tabular-nums ${isActive ? 'opacity-80' : 'text-outline'}`}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
