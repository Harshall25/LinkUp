import { useRef, useState } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { mediaAPI } from '../../api/media';
import { postsAPI } from '../../api/posts';

export function PostComposer({ currentUser, onPostCreated }) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [manualTags, setManualTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    if (file.type.startsWith('video/')) {
      setVideoPreview(previewUrl);
      setImagePreview(null);
    } else {
      setImagePreview(previewUrl);
      setVideoPreview(null);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setSelectedImage(null);
    setImagePreview(null);
    setVideoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !manualTags.includes(t)) {
      setManualTags([...manualTags, t]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setManualTags(manualTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage) return;
    try {
      setPosting(true);
      let imageUrl = null;
      if (selectedImage) {
        const uploadResponse = await mediaAPI.uploadMedia(selectedImage);
        imageUrl = uploadResponse.url;
      }
      const contentHashtags = content.match(/#[\w]+/g) || [];
      const extracted = contentHashtags.map((tag) => tag.slice(1));
      const allTags = [...new Set([...extracted, ...manualTags])];

      const postData = {
        content,
        tags: allTags,
        ...(imageUrl && { imageUrl }),
      };

      await postsAPI.createPost(postData);
      setContent('');
      setManualTags([]);
      setTagInput('');
      handleRemoveImage();
      await onPostCreated?.();
    } catch (error) {
      console.error('Failed to create post:', error);

      alert(
        `Failed to create post: ${
  error.response?.data?.error || error.message
}`
      );
    } finally {
      setPosting(false);
    }
  };

  const canSubmit = (content.trim() || selectedImage) && !posting;

  return (
    <div className="p-5 border-b border-outline-variant/40">
      <div className="flex gap-4">

        <div className="hidden sm:block">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.name}
            size="lg"
          />
        </div>

        <div className="flex-1">

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a note, a proof sketch, or a room worth joining…"
            className="w-full text-base placeholder:text-outline border-none focus:ring-0 resize-none h-24 bg-transparent text-on-surface"
          />

          {/* ------------------------------------------------
              Media Preview
          ------------------------------------------------ */}

          {(imagePreview || videoPreview) && (
            <div className="relative mb-3">

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-80 object-cover rounded-2xl border border-outline-variant/40"
                />
              ) : (
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-80 object-cover rounded-2xl border border-outline-variant/40"
                />
              )}

              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-tertiary/60 hover:bg-tertiary/80 rounded-full text-on-primary"
              >
                <X size={18} strokeWidth={1.75} />
              </button>

            </div>
          )}

          {/* ------------------------------------------------
              Tags
          ------------------------------------------------ */}

          <div className="mb-3">

            <div className="flex flex-wrap gap-2 mb-2">

              {manualTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-fixed/60 text-primary rounded-full text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary-fixed rounded-full p-0.5"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  (e.preventDefault(), handleAddTag())
                }
                placeholder="Add topic tags — hit Enter"
                className="flex-1 text-sm px-3.5 py-1.5 border border-outline-variant/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container bg-surface-container-low text-on-surface"
              />

              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-3.5 py-1.5 bg-primary-container text-on-primary rounded-full text-sm font-semibold hover:bg-primary disabled:opacity-50 active:translate-y-[1px]"
              >
                Add
              </button>
            </div>
          </div>

          {/* ------------------------------------------------
              Bottom Actions
          ------------------------------------------------ */}

          <div className="flex items-center justify-between">
            <div className="flex gap-1 text-primary">

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*,video/*"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-primary-fixed/60 rounded-full transition-colors"
                aria-label="Attach image or video"
              >
                <ImageIcon size={20} strokeWidth={1.75} />
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={
                !canSubmit
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }
            >
              {posting && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {posting ? 'Publishing…' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}