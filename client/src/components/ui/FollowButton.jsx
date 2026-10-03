import { useState } from 'react';
import { usersAPI } from '../../api/users';
import { Button } from './Button';

export function FollowButton({ userId, initialFollowing = false, className = '' }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [hovered, setHovered] = useState(false);

  const toggle = async () => {
    const next = !following;
    setFollowing(next);
    setPending(true);
    try {
      if (next) await usersAPI.followUser(userId);
      else await usersAPI.unfollowUser(userId);
    } catch {
      setFollowing(!next);
    } finally {
      setPending(false);
    }
  };

  const label = following ? (hovered ? 'Unfollow' : 'Following') : 'Follow';

  return (
    <Button
      variant={following ? 'secondary' : 'primary'}
      onClick={toggle}
      disabled={pending}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={following}
      className={`min-w-[92px] px-3.5 py-1.5 text-xs ${following && hovered ? 'hover:text-error hover:border-error/40' : ''} ${className}`}
    >
      {label}
    </Button>
  );
}
