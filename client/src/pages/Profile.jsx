import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, PenLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/users';
import { usePostFeed } from '../hooks/usePostFeed';
import { AppShell } from '../components/layout/AppShell';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState, PostList } from '../components/post/PostList';
import { handleOf } from '../utils/format';
import { formatMonthYear } from '../utils/time';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const feed = usePostFeed(user?.id ? { author: user.id } : null);

  useEffect(() => {
    let active = true;
    usersAPI
      .getCurrentUser()
      .then((res) => active && setProfile(res.user))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const name = profile?.name || user?.name || 'Member';
  const avatar = profile?.avatar || user?.avatar;

  return (
    <AppShell>
      <div className="h-32 sm:h-44 bg-gradient-to-br from-primary-fixed via-secondary-container to-primary-fixed-dim" />

      <div className="px-5 sm:px-6 pb-5">
        <div className="-mt-12 sm:-mt-14 mb-3">
          <div className="p-1 bg-surface-container-lowest rounded-full inline-block">
            <Avatar src={avatar} alt={name} size="xl" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-on-surface tracking-editorial">{name}</h1>
        <p className="text-on-surface-variant">{handleOf(profile || user)}</p>

        {profile?.createdAt && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
            <CalendarDays size={15} strokeWidth={1.75} />
            Joined {formatMonthYear(profile.createdAt)}
          </p>
        )}

        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <Stat value={feed.status === 'ready' ? feed.total : null} label="Posts" />
          <Stat value={profile?.following} label="Following" />
          <Stat value={profile?.followers} label="Followers" />
        </dl>
      </div>

      <div className="px-5 sm:px-6 py-2 border-y border-outline-variant/40">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary-fixed/60 text-primary text-sm font-semibold">
          Posts
        </span>
      </div>

      <PostList
        feed={feed}
        emptyState={
          <EmptyState
            icon={PenLine}
            title="You haven't posted yet"
            description="Your posts will appear here once you share something."
          >
            <Button className="mt-5" onClick={() => navigate('/', { state: { compose: Date.now() } })}>
              Create your first post
            </Button>
          </EmptyState>
        }
      />
    </AppShell>
  );
}

function Stat({ value, label }) {
  return (
    <div className="flex gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="font-semibold text-on-surface tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : '–'}
      </dd>
      <span className="text-on-surface-variant" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
