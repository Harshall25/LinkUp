import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ImageOff, Loader2, MessageCircle, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../api/posts';
import { isVideoUrl } from '../../api/media';
import { getErrorMessage } from '../../api/axios';
import { formatFullDate, getTimeAgo } from '../../utils/time';
import { handleOf, hashtagPath, splitHashtags } from '../../utils/format';

export function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const author = post.author || {};
  const authorName = author.name || 'Unknown member';
  const isOwn = !!user?.id && user.id === author._id;

  const [liked, setLiked] = useState(!!post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const likeInFlight = useRef(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [error, setError] = useState('');

  const toggleLike = async () => {
    if (likeInFlight.current) return;
    likeInFlight.current = true;
    const next = !liked;
    setLiked(next);
    setLikesCount((count) => Math.max(0, count + (next ? 1 : -1)));
    try {
      const res = next ? await postsAPI.likePost(post._id) : await postsAPI.unlikePost(post._id);
      setLikesCount(res.likesCount);
    } catch {
      setLiked(!next);
      setLikesCount((count) => Math.max(0, count + (next ? -1 : 1)));
    } finally {
      likeInFlight.current = false;
    }
  };

  const contentTags = new Set(
    splitHashtags(post.content)
      .filter((part) => typeof part !== 'string')
      .map((part) => part.tag.toLowerCase())
  );
  const extraTags = (post.tags || []).filter((tag) => !contentTags.has(tag.toLowerCase()));

  return (
    <article className="px-5 py-4 transition-colors hover:bg-surface-container-low/40">
      <div className="flex gap-3.5">
        <Avatar src={author.avatar} alt={authorName} />
        <div className="flex-1 min-w-0">
          <header className="flex items-start gap-2 min-h-[24px]">
            <div className="flex-1 min-w-0 flex items-baseline gap-x-1.5 flex-wrap leading-6">
              <span className="font-semibold text-on-surface truncate max-w-full">{authorName}</span>
              <span className="text-sm text-on-surface-variant truncate">{handleOf(author)}</span>
              <span className="text-sm text-outline" aria-hidden="true">·</span>
              <time
                dateTime={post.createdAt}
                title={formatFullDate(post.createdAt)}
                className="text-sm text-outline whitespace-nowrap"
              >
                {getTimeAgo(post.createdAt)}
              </time>
            </div>
            {isOwn && (
              <DeleteControl
                postId={post._id}
                onDeleted={onDeleted}
                onError={(err) => setError(getErrorMessage(err, "Couldn't delete this post."))}
              />
            )}
          </header>

          {post.title && (
            <h3 className="mt-1 font-semibold text-on-surface tracking-editorial">{post.title}</h3>
          )}

          {post.content && (
            <p className="mt-0.5 text-[15px] text-on-surface whitespace-pre-wrap break-words leading-relaxed">
              <PostText text={post.content} />
            </p>
          )}

          {post.imageUrl && <PostMedia url={post.imageUrl} alt={`Shared by ${authorName}`} />}

          {extraTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {extraTags.map((tag) => (
                <Link
                  key={tag}
                  to={hashtagPath(tag)}
                  className="px-2.5 py-0.5 rounded-full bg-primary-fixed/60 text-primary text-xs font-semibold hover:bg-primary-fixed transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {error && <p className="mt-2 text-sm text-error">{error}</p>}

          <div className="mt-2 -ml-2 flex items-center gap-1">
            <ActionButton
              icon={MessageCircle}
              label={commentsOpen ? 'Hide comments' : 'Show comments'}
              count={commentsCount}
              active={commentsOpen}
              onClick={() => setCommentsOpen((open) => !open)}
            />
            <ActionButton
              icon={Heart}
              label={liked ? 'Unlike' : 'Like'}
              count={likesCount}
              active={liked}
              filled={liked}
              onClick={toggleLike}
            />
          </div>

          {commentsOpen && <CommentsSection postId={post._id} onCountChange={setCommentsCount} />}
        </div>
      </div>
    </article>
  );
}

function PostText({ text }) {
  return splitHashtags(text).map((part, i) =>
    typeof part === 'string' ? (
      <Fragment key={i}>{part}</Fragment>
    ) : (
      <Link key={i} to={hashtagPath(part.tag)} className="text-primary font-medium hover:underline">
        #{part.tag}
      </Link>
    )
  );
}

function PostMedia({ url, alt }) {
  const [failed, setFailed] = useState(false);
  const frame = 'mt-3 rounded-2xl overflow-hidden border border-outline-variant/50';

  if (failed) {
    return (
      <div className={`${frame} bg-surface-container-low flex items-center justify-center gap-2 py-10 text-sm text-on-surface-variant`}>
        <ImageOff size={18} strokeWidth={1.75} />
        Media unavailable
      </div>
    );
  }

  if (isVideoUrl(url)) {
    return (
      <div className={`${frame} bg-black`}>
        <video
          // The #t fragment makes iOS Safari render the first frame as a poster.
          src={`${url}#t=0.1`}
          controls
          playsInline
          preload="metadata"
          aria-label={alt}
          className="block w-full max-h-[540px]"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${frame} bg-surface-container-low`}>
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="block w-full max-h-[540px] object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function ActionButton({ icon: Icon, label, count, active, filled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-sm transition-colors hover:bg-primary-fixed/50 ${
        active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
      }`}
    >
      <Icon size={18} strokeWidth={1.75} className={filled ? 'fill-current' : ''} />
      <span className="tabular-nums font-medium">{count}</span>
    </button>
  );
}

function DeleteControl({ postId, onDeleted, onError }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await postsAPI.deletePost(postId);
      onDeleted?.(postId);
    } catch (err) {
      onError(err);
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Delete post"
        title="Delete post"
        className="-mr-1.5 -mt-0.5 p-1.5 rounded-full text-outline hover:text-error hover:bg-error-container/60 transition-colors"
      >
        <Trash2 size={16} strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 -mt-0.5">
      <Button variant="ghost" className="px-3 py-1 text-xs" onClick={() => setConfirming(false)} disabled={deleting}>
        Cancel
      </Button>
      <Button variant="danger" className="px-3 py-1 text-xs" onClick={remove} disabled={deleting}>
        {deleting ? <Loader2 size={12} className="animate-spin" /> : 'Delete'}
      </Button>
    </div>
  );
}

function CommentsSection({ postId, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    postsAPI
      .getComments(postId)
      .then((res) => {
        if (!active) return;
        setComments(res.comments || []);
        onCountChange(res.count ?? res.comments?.length ?? 0);
      })
      .catch(() => active && setLoadFailed(true));
    return () => {
      active = false;
    };
  }, [postId, onCountChange]);

  const submit = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || posting) return;
    setPosting(true);
    setError('');
    try {
      const res = await postsAPI.addComment(postId, content);
      setComments((prev) => [res.comment, ...(prev || [])]);
      onCountChange(res.commentsCount);
      setDraft('');
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't post your comment."));
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="mt-3 pt-4 border-t border-outline-variant/40" aria-label="Comments">
      <form onSubmit={submit} className="flex gap-2.5 items-center">
        <Avatar src={user?.avatar} alt={user?.name || 'You'} size="sm" />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          placeholder="Write a comment…"
          aria-label="Write a comment"
          className="flex-1 min-w-0 px-3.5 py-2 text-sm rounded-full bg-surface-container-low border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container text-on-surface placeholder:text-outline"
        />
        <Button type="submit" disabled={!draft.trim() || posting} className="px-4 py-2 text-sm">
          {posting ? <Loader2 size={14} className="animate-spin" /> : 'Reply'}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}

      <div className="mt-4">
        {loadFailed ? (
          <p className="text-sm text-on-surface-variant text-center py-3">Couldn&apos;t load comments.</p>
        ) : comments === null ? (
          <div className="flex justify-center py-3">
            <Loader2 size={18} className="animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-3">No comments yet. Start the conversation.</p>
        ) : (
          <ul className="space-y-3.5">
            {comments.map((comment) => (
              <li key={comment._id} className="flex gap-2.5">
                <Avatar src={comment.user?.avatar} alt={comment.user?.name || 'Member'} size="sm" />
                <div className="flex-1 min-w-0 rounded-2xl bg-surface-container-low px-3.5 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-on-surface truncate">
                      {comment.user?.name || 'Member'}
                    </span>
                    <time
                      dateTime={comment.createdAt}
                      title={formatFullDate(comment.createdAt)}
                      className="text-xs text-outline whitespace-nowrap"
                    >
                      {getTimeAgo(comment.createdAt)}
                    </time>
                  </div>
                  <p className="text-sm text-on-surface mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
