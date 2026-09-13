import { Loader2 } from 'lucide-react';
import { PostCard } from '../../components/post/PostCard';

export function Feed({ posts, loading, feedType, setFeedType, likedPosts, onLike, onSelectHashtag }) {
  return (
    <>
      <div className="sticky top-16 md:top-16 z-30 bg-surface-container-lowest/95 backdrop-blur-md px-5 border-b border-outline-variant/40 flex items-center">
        <div className="flex gap-1 py-2">
          <TabButton active={feedType === 'forYou'} onClick={() => setFeedType('forYou')} label="For You" />
          <TabButton active={feedType === 'following'} onClick={() => setFeedType('following')} label="Following" />
        </div>
      </div>

      {loading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="divide-y divide-outline-variant/30">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={() => onLike(post._id)}
              isLiked={likedPosts.has(post._id)}
              onSelectHashtag={onSelectHashtag}
            />
          ))}
        </div>
      )}
    </>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
        active
          ? 'text-primary bg-primary-fixed/60'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
      }`}
    >
      {label}
    </button>
  );
}

function FeedSkeleton() {
  return (
    <div className="divide-y divide-outline-variant/30">
      {[0, 1, 2].map((i) => (
        <div key={i} className="p-5 flex gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-surface-container" />
          <div className="flex-1 space-y-3">
            <div className="h-3 rounded-full bg-surface-container w-1/3" />
            <div className="h-3 rounded-full bg-surface-container w-4/5" />
            <div className="h-3 rounded-full bg-surface-container w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="px-8 py-14 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-primary-fixed/50 flex items-center justify-center text-primary text-xl font-bold">
        L
      </div>
      <h3 className="mt-5 font-semibold text-on-surface tracking-editorial">
        This room is quiet — for now.
      </h3>
      <p className="mt-1 text-sm text-on-surface-variant">
        Share what you&apos;re building. The first note sets the tone.
      </p>
    </div>
  );
}
