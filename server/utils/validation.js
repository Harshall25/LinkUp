const mongoose = require('mongoose');

// Zod v4 exposes problems on `issues`; surface the first one as a readable message.
const zodMessage = (error) => error.issues?.[0]?.message || 'Invalid request';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const exactMatch = (value) => new RegExp(`^${escapeRegex(value)}$`, 'i');

const isObjectId = (value) => mongoose.isValidObjectId(value);

const MAX_TAGS = 10;

function normalizeTag(tag) {
    return String(tag)
        .replace(/^#+/, '')
        .replace(/[^\p{L}\p{N}_]/gu, '')
        .toLowerCase()
        .slice(0, 50);
}

function extractHashtags(text) {
    return [...String(text || '').matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1]);
}

function normalizeTags(tags) {
    return [...new Set(tags.map(normalizeTag).filter(Boolean))].slice(0, MAX_TAGS);
}

module.exports = { zodMessage, escapeRegex, exactMatch, isObjectId, normalizeTags, extractHashtags };
