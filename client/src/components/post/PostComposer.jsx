import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Hash, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { MAX_UPLOAD_BYTES, mediaAPI } from '../../api/media';
import { postsAPI } from '../../api/posts';
import { getErrorMessage } from '../../api/axios';

const MAX_LENGTH = 5000;
const MAX_TAGS = 10;

export function PostComposer({ currentUser, onPostCreated, focusKey }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [posting, setPosting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (focusKey) textareaRef.current?.focus();
  }, [focusKey]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview.url), [preview]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Chrome counts placeholder text in scrollHeight, so only measure real text.
    el.style.height = '';
    if (content) el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [content]);

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;
    if (!/^(image|video)\//.test(picked.type)) {
      setError('Only images and videos can be attached.');
      return;
    }
    if (picked.size > MAX_UPLOAD_BYTES) {
      setError('Files must be 50 MB or smaller.');
      return;
    }
    setError('');
    setFile(picked);
    setPreview({ url: URL.createObjectURL(picked), isVideo: picked.type.startsWith('video/') });
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#+/, '').replace(/[^\p{L}\p{N}_]/gu, '').toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < MAX_TAGS) setTags([...tags, tag]);
    setTagInput('');
  };

  const canSubmit = (content.trim() || file) && content.length <= MAX_LENGTH && !posting;

  const submit = async () => {
    if (!canSubmit) return;
    setPosting(true);
    setError('');
    try {
      let imageUrl;
      if (file) {
        setProgress(0);
        imageUrl = await mediaAPI.uploadMedia(file, setProgress);
      }
      const { post } = await postsAPI.createPost({
        content: content.trim(),
        tags,
        ...(imageUrl && { imageUrl }),
      });
      setContent('');
      setTags([]);
      setTagInput('');
      clearFile();
      onPostCreated?.(post);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't publish your post. Please try again."));
    } finally {
      setPosting(false);
      setProgress(null);
    }
  };

  const remaining = MAX_LENGTH - content.length;

  return (
    <div className="px-5 pt-5 pb-4 border-b border-outline-variant/40">
      <div className="flex gap-3.5">
        <div className="hidden sm:block">
          <Avatar src={currentUser?.avatar} alt={currentUser?.name || 'You'} size="lg" />
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="What's on your mind?"
            aria-label="Write a post"
            className="w-full min-h-[56px] pt-2.5 text-[17px] leading-relaxed placeholder:text-outline border-none focus:ring-0 resize-none bg-transparent text-on-surface"
          />

          {preview && (
            <div className="relative mt-2 rounded-2xl overflow-hidden border border-outline-variant/50 bg-surface-container-low">
              {preview.isVideo ? (
                <video src={preview.url} controls playsInline className="block w-full max-h-80 bg-black" />
              ) : (
                <img src={preview.url} alt="Selected attachment" className="block w-full max-h-80 object-cover" />
              )}
              {!posting && (
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remove attachment"
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/75 rounded-full text-white transition-colors"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              )}
              {progress !== null && (
                <div className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-white text-xs font-medium">
                  <div className="flex justify-between mb-1">
                    <span>{progress < 1 ? 'Uploading…' : 'Processing…'}</span>
                    <span className="tabular-nums">{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/25 overflow-hidden">
                    <div
                      className="h-full bg-white transition-[width] duration-200"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 bg-primary-fixed/60 text-primary rounded-full text-xs font-semibold"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="hover:bg-primary-fixed rounded-full p-0.5"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={12} strokeWidth={2.25} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {error && (
            <p role="alert" className="mt-3 text-sm text-error">
              {error}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-outline-variant/40 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={pickFile}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={posting}
              className="p-2 -ml-2 text-primary hover:bg-primary-fixed/60 rounded-full transition-colors disabled:opacity-50"
              aria-label="Attach a photo or video"
              title="Photo or video"
            >
              <ImageIcon size={20} strokeWidth={1.75} />
            </button>

            <label className="flex items-center gap-1 flex-1 min-w-0 max-w-[220px] px-2.5 py-1 rounded-full text-sm text-on-surface-variant focus-within:bg-surface-container-low transition-colors">
              <Hash size={15} strokeWidth={2} className="text-primary flex-shrink-0" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                disabled={posting || tags.length >= MAX_TAGS}
                placeholder="Add a topic"
                aria-label="Add a topic tag"
                className="w-full min-w-0 bg-transparent border-none p-0 text-sm focus:outline-none placeholder:text-outline text-on-surface"
              />
            </label>

            <div className="ml-auto flex items-center gap-3">
              {remaining < 200 && (
                <span className={`text-xs tabular-nums ${remaining < 0 ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
                  {remaining}
                </span>
              )}
              <Button onClick={submit} disabled={!canSubmit} className="px-5">
                {posting && <Loader2 size={16} className="animate-spin" />}
                {posting ? 'Posting…' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
