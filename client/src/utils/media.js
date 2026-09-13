const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function convertImageUrl(url) {
  if (!url) return null;
  if (url.includes('/api/v1/media/file/')) return url;
  if (url.includes('r2.cloudflarestorage.com') || url.includes('r2.dev')) {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return `${API_BASE}/api/v1/media/file/media/${fileName}`;
  }
  return url;
}
