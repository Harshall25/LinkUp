export function getTimeAgo(date) {
  const now = new Date();
  const postDate = new Date(date);
  const diff = Math.floor((now - postDate) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return postDate.toLocaleDateString();
}
