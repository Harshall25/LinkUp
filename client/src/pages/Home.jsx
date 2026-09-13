import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../api/posts';
import { usersAPI } from '../api/users';
import { AppShell } from '../components/layout/AppShell';
import { PostComposer } from '../components/post/PostComposer';
import { Feed } from './views/Feed';
import { ProfileView } from './views/ProfileView';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [feedType, setFeedType] = useState('forYou');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [likedPosts, setLikedPosts] = useState(new Set());
  const [following, setFollowing] = useState(new Set());
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);

  const CURRENT_USER = {
    id: user?.id || 'u1',
    name: user?.name || 'User',
    handle: `@${user?.email?.split('@')[0] || 'user'}`,
    avatar: null,
    bio: 'Salon member',
    following: 0,
    followers: 0,
    cover:
      'https://picsum.photos/seed/linkup-cover/1600/400',
  };

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Any tab other than home/profile centralises through the /search page.
  useEffect(() => {
    if (activeTab === 'explore') {
      navigate('/search');
    }
  }, [activeTab, navigate]);

  const fetchPosts = useCallback(
    async (feedTypeParam = null) => {
      try {
        setLoading(true);
        const current = feedTypeParam ?? feedType;
        const params = { limit: 50, sortBy: 'createdAt', sortOrder: 'desc' };
        if (current === 'following') params.feedType = 'following';
        const response = await postsAPI.getPosts(params);
        setPosts(response.posts || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    },
    [feedType]
  );

  const fetchTrendingHashtags = useCallback(async () => {
    try {
      const response = await postsAPI.getTrendingHashtags(10);
      setTrendingHashtags(response.trending || []);
    } catch (error) {
      console.error('Failed to fetch trending hashtags:', error);
    }
  }, []);

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      const response = await usersAPI.getSuggestedUsers();
      setSuggestedUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch suggested users:', error);
    }
  }, []);

  const fetchCurrentUserData = useCallback(async () => {
    try {
      const response = await usersAPI.getCurrentUser();
      setCurrentUserData(response.user);
    } catch (error) {
      console.error('Failed to fetch current user data:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchTrendingHashtags();
    fetchSuggestedUsers();
    fetchCurrentUserData();
  }, [fetchPosts, fetchTrendingHashtags, fetchSuggestedUsers, fetchCurrentUserData]);

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
      await fetchSuggestedUsers();
      await fetchCurrentUserData();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
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
        setPosts((current) =>
          current.map((p) =>
            p._id === postId ? { ...p, likesCount: Math.max(0, p.likesCount - 1) } : p
          )
        );
      } else {
        await postsAPI.likePost(postId);
        setLikedPosts((prev) => new Set(prev).add(postId));
        setPosts((current) =>
          current.map((p) => (p._id === postId ? { ...p, likesCount: p.likesCount + 1 } : p))
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSelectHashtag = (tag) => {
    navigate(`/search?q=${encodeURIComponent(`#${tag}`)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const rightSidebarProps = {
    onSelectHashtag: handleSelectHashtag,
    trendingHashtags,
    suggestedUsers,
    following,
    onToggleFollow: handleToggleFollow,
  };

  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUser={CURRENT_USER}
      onLogout={handleLogout}
      rightSidebarProps={rightSidebarProps}
    >
      {activeTab === 'profile' ? (
        <ProfileView
          user={{
            ...CURRENT_USER,
            ...currentUserData,
            handle: currentUserData ? `@${currentUserData.email?.split('@')[0]}` : CURRENT_USER.handle,
          }}
          posts={posts.filter((p) => p.author?._id === (currentUserData?.id || CURRENT_USER.id))}
          onLike={handleLike}
          likedPosts={likedPosts}
          onSelectHashtag={handleSelectHashtag}
        />
      ) : (
        <>
          <PostComposer
            currentUser={CURRENT_USER}
            onPostCreated={async () => {
              await fetchPosts();
              await fetchTrendingHashtags();
            }}
          />
          <Feed
            posts={posts}
            loading={loading}
            feedType={feedType}
            setFeedType={setFeedType}
            likedPosts={likedPosts}
            onLike={handleLike}
            onSelectHashtag={handleSelectHashtag}
          />
        </>
      )}
    </AppShell>
  );
}
