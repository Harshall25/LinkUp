import { Avatar } from '../../components/ui/Avatar';
import { PostCard } from '../../components/post/PostCard';

export function ProfileView({ user, posts, onLike, likedPosts, onSelectHashtag }) {
  return (
    <div className="pb-8">
      <div className="h-40 bg-gradient-to-br from-primary-fixed-dim to-secondary-container" />

      <div className="px-5 relative">
        <div className="-mt-14 mb-3">
          <div className="p-1 bg-surface-container-lowest rounded-full inline-block">
            <Avatar src={user.avatar} alt={user.name} size="xl" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-editorial">{user.name}</h1>
          <p className="text-on-surface-variant">{user.handle}</p>
        </div>

        {user.bio && (
          <p className="mt-3 text-on-surface leading-relaxed max-w-[65ch]">{user.bio}</p>
        )}

        <div className="mt-4 flex gap-6 text-sm">
          <div className="flex gap-1">
            <span className="font-semibold text-on-surface">{user.following ?? 0}</span>
            <span className="text-on-surface-variant">Following</span>
          </div>
          <div className="flex gap-1">
            <span className="font-semibold text-on-surface">{user.followers ?? 0}</span>
            <span className="text-on-surface-variant">Followers</span>
          </div>
        </div>
      </div>

      <div className="mt-6 px-5 pb-2 border-b border-outline-variant/40">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary-fixed/60 text-primary text-sm font-semibold">
          Posts
        </span>
      </div>

      <div className="divide-y divide-outline-variant/30">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={() => onLike(post._id)}
              isLiked={likedPosts.has(post._id)}
              onSelectHashtag={onSelectHashtag}
            />
          ))
        ) : (
          <div className="p-8 text-center text-on-surface-variant text-sm">
            No posts yet.
          </div>
        )}
      </div>
    </div>
  );
}
