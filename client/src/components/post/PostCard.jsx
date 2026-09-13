import { useState } from 'react';
import { Heart, MessageCircle, Loader2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { ActionIcon } from './ActionIcon';
import { getTimeAgo } from '../../utils/time';
import { convertImageUrl } from '../../utils/media';
import { postsAPI } from '../../api/posts';

export function PostCard({ post, onLike, isLiked, onSelectHashtag }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const authorName = post.author?.name || 'Unknown Member';
  const authorHandle = post.author?.email ? `@${post.author.email.split('@')[0]}` : '@member';

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await postsAPI.getComments(post._id);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setPostingComment(true);
      await postsAPI.addComment(post._id, newComment);
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setPostingComment(false);
    }
  };

  const toggleComments = () => {
    setShowComments((v) => !v);
    if (!showComments && comments.length === 0) fetchComments();
  };

  return (
    <article className="p-5 hover:bg-surface-container-low transition-colors">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Avatar src={null} alt={authorName} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-on-surface truncate">{authorName}</span>
            <span className="text-on-surface-variant text-sm truncate">{authorHandle}</span>
            <span className="text-outline text-xs flex-shrink-0">· {getTimeAgo(post.createdAt)}</span>
          </div>

          {post.title && (
            <h3 className="mt-1 font-semibold text-on-surface tracking-editorial">{post.title}</h3>
          )}

          <div className="mt-1 text-on-surface whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>

          {post.imageUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-outline-variant/40">
                {/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(post.imageUrl) ? (
                    <video
                        src={post.imageUrl}
                        controls
                        preload="metadata"
                        className="w-full h-auto max-h-[500px]"
                        onError={(e) => {
                          console.error('Video failed:', e.currentTarget.src);
                        }}
                    />
                ) : (
                    <img
                        src={convertImageUrl(post.imageUrl)}
                        alt="Post content"
                        className="w-full h-auto object-cover max-h-[500px]"
                        onError={(e) => {
                          console.error('Image failed:', e.currentTarget.src);
                        }}
                    />
                )}
              </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <button
                  key={i}
                  className="text-primary text-sm font-medium hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHashtag?.(tag);
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-6 text-on-surface-variant">
            <button
              onClick={toggleComments}
              className="flex items-center gap-2 transition-colors text-on-surface-variant hover:text-primary hover:bg-primary-fixed/60 px-2 py-1.5 rounded-full"
            >
              <MessageCircle size={18} strokeWidth={1.75} />
              <span className="text-xs font-medium">{comments.length || 0}</span>
            </button>
            <ActionIcon
              icon={Heart}
              count={post.likesCount || 0}
              isActive={isLiked}
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              color={isLiked ? 'text-primary' : 'hover:text-primary hover:bg-primary-fixed/60'}
              fill={isLiked}
            />
          </div>

          {showComments && (
            <div className="mt-4 border-t border-outline-variant/40 pt-4">
              <div className="flex gap-3 mb-4">
                <Avatar src={null} alt="You" size="sm" />
                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder="Write a comment..."
                      className="flex-1 px-3.5 py-2 text-sm rounded-full bg-surface-container-low border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container text-on-surface"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || postingComment}
                      className="px-4 py-2 bg-primary-container text-on-primary text-sm font-semibold rounded-full hover:bg-primary disabled:opacity-50 transition-colors active:translate-y-[1px]"
                    >
                      {postingComment ? <Loader2 size={14} className="animate-spin" /> : 'Post'}
                    </button>
                  </div>
                </div>
              </div>

              {loadingComments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <Avatar src={null} alt={comment.user?.name || 'Member'} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-on-surface">
                            {comment.user?.name || 'Member'}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {getTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm text-center py-4">
                  No comments yet. Be the first to comment.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
