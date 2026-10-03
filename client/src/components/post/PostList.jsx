import { Loader2, RefreshCw } from 'lucide-react';
import { PostCard } from './PostCard';
import { Button } from '../ui/Button';

export function PostList({ feed, emptyState, onDeleted }) {
  if (feed.status === 'loading') return <FeedSkeleton />;

  if (feed.status === 'error') {
    return (
      <div className="px-6 py-14 text-center">
        <h3 className="font-semibold text-on-surface">Couldn&apos;t load posts</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Check your connection and try again.</p>
        <Button variant="secondary" className="mt-5" onClick={feed.retry}>
          <RefreshCw size={15} strokeWidth={2} />
          Try again
        </Button>
      </div>
    );
  }

  if (feed.posts.length === 0) return emptyState;

  const handleDeleted = (postId) => {
    feed.remove(postId);
    onDeleted?.(postId);
  };

  return (
    <>
      <div className="divide-y divide-outline-variant/40">
        {feed.posts.map((post) => (
          <PostCard key={post._id} post={post} onDeleted={handleDeleted} />
        ))}
      </div>
      {feed.hasMore && (
        <div className="p-5 flex justify-center border-t border-outline-variant/40">
          <Button variant="secondary" onClick={feed.loadMore} disabled={feed.loadingMore}>
            {feed.loadingMore && <Loader2 size={15} className="animate-spin" />}
            {feed.loadingMore ? 'Loading…' : 'Show more posts'}
          </Button>
        </div>
      )}
    </>
  );
}

export function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="px-8 py-16 text-center">
      {Icon && (
        <div className="mx-auto w-14 h-14 rounded-full bg-primary-fixed/60 flex items-center justify-center text-primary">
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <h3 className="mt-5 font-semibold text-on-surface tracking-editorial">{title}</h3>
      {description && <p className="mt-1 text-sm text-on-surface-variant max-w-sm mx-auto">{description}</p>}
      {children}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="divide-y divide-outline-variant/40" aria-busy="true" aria-label="Loading posts">
      {[0, 1, 2].map((i) => (
        <div key={i} className="px-5 py-5 flex gap-3.5 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-surface-container" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-3 rounded-full bg-surface-container w-1/3" />
            <div className="h-3 rounded-full bg-surface-container w-4/5" />
            <div className="h-3 rounded-full bg-surface-container w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
