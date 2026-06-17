/**
 * Universal Upload Handler
 * - Uses Cloudinary for Vercel (read-only filesystem)
 * - Falls back to local storage for local development
 * - Consistent behavior across all environments
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degd6ahfu';
const FORCE_CLOUDINARY = import.meta.env.VITE_FORCE_CLOUDINARY_UPLOADS === 'true';
const VERCEL = !!process.env.VERCEL || window.location.hostname.includes('vercel.app');

/**
 * Upload file using Cloudinary API (works everywhere)
 */
export const uploadToCloudinary = async (
  file: File,
  displayName: string,
  onProgress?: (percent: number) => void
): Promise<{ url: string; name: string; type: 'image' | 'video' }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'portfolio-cms');
  formData.append('public_id', displayName.replace(/\s+/g, '-').toLowerCase());
  formData.append('resource_type', 'auto'); // auto-detect image or video
  formData.append('upload_preset', 'portfolio_uploads'); // Requires preset configured in Cloudinary

  try {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (xhr.upload && onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      });
    }

    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          const fileType = response.resource_type === 'video' ? 'video' : 'image';
          resolve({
            url: response.secure_url,
            name: displayName,
            type: fileType,
          });
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.ontimeout = () => reject(new Error('Upload timeout'));

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload file using local API (development only)
 */
export const uploadToLocal = async (
  file: File,
  displayName: string,
  onProgress?: (percent: number) => void
): Promise<{ url: string; name: string; type: 'image' | 'video' }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', displayName);

  try {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (xhr.upload && onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      });
    }

    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.url,
            name: response.name,
            type: response.type,
          });
        } else {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || 'Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.ontimeout = () => reject(new Error('Upload timeout'));

      xhr.open('POST', '/api/media/upload');
      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Local upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Smart upload handler: auto-selects best method per environment
 */
export const smartUpload = async (
  file: File,
  displayName: string,
  onProgress?: (percent: number) => void
): Promise<{ url: string; name: string; type: 'image' | 'video' }> => {
  // Force Cloudinary if:
  // 1. FORCE_CLOUDINARY_UPLOADS env var is true, OR
  // 2. Running on Vercel (read-only filesystem)
  if (FORCE_CLOUDINARY || VERCEL) {
    return uploadToCloudinary(file, displayName, onProgress);
  }

  // For local/Gemini: try local first, fall back to Cloudinary if available
  try {
    return await uploadToLocal(file, displayName, onProgress);
  } catch (localError) {
    console.warn('Local upload failed, falling back to Cloudinary:', localError);
    try {
      return await uploadToCloudinary(file, displayName, onProgress);
    } catch (cloudinaryError) {
      throw new Error(`All upload methods failed. Local: ${localError}. Cloudinary: ${cloudinaryError}`);
    }
  }
};

/**
 * Get environment info (for debugging)
 */
export const getUploadEnvironmentInfo = () => ({
  forceCloudinary: FORCE_CLOUDINARY,
  isVercel: VERCEL,
  cloudName: CLOUDINARY_CLOUD_NAME,
  method: FORCE_CLOUDINARY || VERCEL ? 'cloudinary' : 'local-with-fallback',
});