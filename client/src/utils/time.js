export function getTimeAgo(date) {
  const postDate = new Date(date);
  const diff = Math.floor((Date.now() - postDate) / 1000);

  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  const sameYear = postDate.getFullYear() === new Date().getFullYear();
  return postDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatFullDate(date) {
  return new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatMonthYear(date) {
  return new Date(date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
