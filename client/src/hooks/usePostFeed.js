import { useCallback, useEffect, useRef, useState } from 'react';
import { postsAPI } from '../api/posts';

const PAGE_SIZE = 20;

const mergeUnique = (current, incoming) => {
  const seen = new Set(current.map((post) => post._id));
  return [...current, ...incoming.filter((post) => !seen.has(post._id))];
};

// `params` are the /posts query filters. Pass `null` to wait (e.g. until the
// current user's id is known).
export function usePostFeed(params) {
  const key = params ? JSON.stringify(params) : null;
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  // Bumped per query so responses for a previous filter are ignored.
  const generation = useRef(0);

  useEffect(() => {
    if (!key) return;
    const gen = ++generation.current;
    setStatus('loading');
    setPosts([]);
    setHasMore(false);
    postsAPI
      .getPosts({ ...JSON.parse(key), limit: PAGE_SIZE, skip: 0 })
      .then((res) => {
        if (gen !== generation.current) return;
        setPosts(res.posts || []);
        setTotal(res.total || 0);
        setHasMore(!!res.hasMore);
        setStatus('ready');
      })
      .catch(() => {
        if (gen === generation.current) setStatus('error');
      });
  }, [key, reloadCount]);

  const loadMore = useCallback(async () => {
    if (!key || loadingMore || !hasMore) return;
    const gen = generation.current;
    setLoadingMore(true);
    try {
      const res = await postsAPI.getPosts({ ...JSON.parse(key), limit: PAGE_SIZE, skip: posts.length });
      if (gen !== generation.current) return;
      setPosts((current) => mergeUnique(current, res.posts || []));
      setTotal(res.total || 0);
      setHasMore(!!res.hasMore);
    } catch {
      // Leave the button in place so the user can retry.
    } finally {
      setLoadingMore(false);
    }
  }, [key, loadingMore, hasMore, posts.length]);

  const prepend = useCallback((post) => {
    setPosts((current) => [post, ...current.filter((p) => p._id !== post._id)]);
    setTotal((t) => t + 1);
    setStatus('ready');
  }, []);

  const remove = useCallback((postId) => {
    setPosts((current) => current.filter((p) => p._id !== postId));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  const retry = useCallback(() => setReloadCount((n) => n + 1), []);

  return { posts, status, total, hasMore, loadingMore, loadMore, prepend, remove, retry };
}
