export const hashtagPath = (tag) => `/search?q=${encodeURIComponent(`#${tag}`)}`;

export const handleOf = (user) => (user?.email ? `@${user.email.split('@')[0]}` : '@member');

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count.toLocaleString()} ${count === 1 ? singular : plural}`;

const HASHTAG = /#([\p{L}\p{N}_]+)/gu;

// Splits post text into plain strings and { tag } parts so hashtags can be linked.
export function splitHashtags(text) {
  const source = String(text || '');
  const parts = [];
  let last = 0;
  for (const match of source.matchAll(HASHTAG)) {
    if (match.index > last) parts.push(source.slice(last, match.index));
    parts.push({ tag: match[1] });
    last = match.index + match[0].length;
  }
  if (last < source.length) parts.push(source.slice(last));
  return parts;
}
