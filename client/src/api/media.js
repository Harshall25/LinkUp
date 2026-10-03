import axios from 'axios';
import api from './axios';

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const VIDEO_EXTENSION = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i;
export const isVideoUrl = (url) => VIDEO_EXTENSION.test(url || '');

const progressHandler = (onProgress) => (event) => {
  if (onProgress && event.total) onProgress(event.loaded / event.total);
};

export const mediaAPI = {
  // Uploads straight to storage via a signed URL so large videos skip the API
  // (Vercel caps request bodies at 4.5 MB). If the bucket's CORS policy
  // blocks the browser, fall back to streaming through the API.
  uploadMedia: async (file, onProgress) => {
    const { data: target } = await api.post('/media/upload-url', {
      contentType: file.type,
      size: file.size,
    });

    try {
      // Plain axios, not `api`: the session token must not be sent to storage.
      await axios.put(target.uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: progressHandler(onProgress),
      });
      return target.url;
    } catch (directError) {
      console.warn('Direct upload failed, retrying through the API:', directError.message);
    }

    const form = new FormData();
    form.append('media', file);
    const { data } = await api.post('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: progressHandler(onProgress),
    });
    return data.url;
  },
};
