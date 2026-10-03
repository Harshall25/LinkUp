const MEDIA_ROUTE = '/api/v1/media/file/';
const KEY_PATTERN = /^media\/[A-Za-z0-9._-]+$/;

// Older posts stored absolute URLs (http://localhost:3000/... or the private
// R2 endpoint), which only resolve on the uploader's machine. Every stored
// form ends in the object key, so reduce them all to a host-relative path.
function extractMediaKey(url) {
    if (typeof url !== 'string') return null;
    const match = url.match(/(media\/[^/?#]+)(?:[?#].*)?$/);
    return match && KEY_PATTERN.test(match[1]) ? match[1] : null;
}

function toMediaUrl(url) {
    if (!url) return url;
    const key = extractMediaKey(url);
    return key ? `${MEDIA_ROUTE}${key}` : url;
}

function isMediaUrl(url) {
    return typeof url === 'string' && url.startsWith(MEDIA_ROUTE) && KEY_PATTERN.test(url.slice(MEDIA_ROUTE.length));
}

module.exports = { KEY_PATTERN, extractMediaKey, toMediaUrl, isMediaUrl };
