import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PenLine, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePostFeed } from '../hooks/usePostFeed';
import { AppShell } from '../components/layout/AppShell';
import { PostComposer } from '../components/post/PostComposer';
import { EmptyState, PostList } from '../components/post/PostList';

const FEED_TABS = [
  { id: 'forYou', label: 'For you' },
  { id: 'following', label: 'Following' },
];

export default function HomePage() {
  const { user } = useAuth();
  const location = useLocation();
  const [feedType, setFeedType] = useState('forYou');
  const [railRefreshKey, setRailRefreshKey] = useState(0);
  const feed = usePostFeed(feedType === 'following' ? { feedType: 'following' } : {});
  const refreshRail = () => setRailRefreshKey((k) => k + 1);

  return (
    <AppShell railRefreshKey={railRefreshKey}>
      <div
        role="tablist"
        aria-label="Feed"
        className="md:sticky md:top-16 z-30 bg-surface-container-lowest/90 backdrop-blur-md px-5 border-b border-outline-variant/40 flex gap-1 py-2"
      >
        {FEED_TABS.map((tab) => {
          const active = feedType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFeedType(tab.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                active
                  ? 'text-primary bg-primary-fixed/60'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <PostComposer
        currentUser={user}
        focusKey={location.state?.compose}
        onPostCreated={(post) => {
          feed.prepend(post);
          refreshRail();
        }}
      />

      <PostList
        feed={feed}
        onDeleted={refreshRail}
        emptyState={
          feedType === 'following' ? (
            <EmptyState
              icon={Users}
              title="Nothing here yet"
              description="Follow people from Explore or the suggestions panel and their posts will show up here."
            />
          ) : (
            <EmptyState icon={PenLine} title="No posts yet" description="Be the first to share something." />
          )
        }
      />
    </AppShell>
  );
}
