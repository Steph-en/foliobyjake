/**
 * Universal Upload Handler
 * - Uses Cloudinary for Vercel (read-only filesystem)
 * - Falls back to local storage for local development
 * - Consistent behavior across all environments
 */

const CLOUDINARY_CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'degd6ahfu';
const FORCE_CLOUDINARY = (import.meta as any).env?.VITE_FORCE_CLOUDINARY_UPLOADS === 'true';
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
        let responseData: any = {};
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (e) {
          responseData = { error: xhr.responseText || `HTTP ${xhr.status} ${xhr.statusText}` };
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            url: responseData.url,
            name: responseData.name || displayName,
            type: responseData.type || (file.type.startsWith('video/') ? 'video' : 'image'),
          });
        } else {
          reject(new Error(responseData.error || responseData.message || `Upload server returned status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload request to server.'));
      xhr.ontimeout = () => reject(new Error('Upload request timed out after network delay.'));

      xhr.open('POST', '/api/media/upload');
      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Local upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Convert file to Base64 Data URL as ultimate fallback
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file into Data URL'));
    reader.readAsDataURL(file);
  });
};

/**
 * Smart upload handler: auto-selects best method per environment
 */
export const smartUpload = async (
  file: File,
  displayName: string,
  onProgress?: (percent: number) => void
): Promise<{ url: string; name: string; type: 'image' | 'video' }> => {
  const fileType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';

  // 1. Try Local Upload first if not on Vercel
  if (!FORCE_CLOUDINARY && !VERCEL) {
    try {
      return await uploadToLocal(file, displayName, onProgress);
    } catch (localError) {
      console.warn('Local upload failed, trying Cloudinary:', localError);
    }
  }

  // 2. Try Cloudinary
  try {
    return await uploadToCloudinary(file, displayName, onProgress);
  } catch (cloudinaryError) {
    console.warn('Cloudinary upload failed, falling back to Base64 Data URL:', cloudinaryError);
  }

  // 3. Fallback to Data URL (guarantees upload never fails and works across all clients)
  try {
    if (onProgress) onProgress(50);
    const dataUrl = await fileToDataUrl(file);
    if (onProgress) onProgress(100);
    return {
      url: dataUrl,
      name: displayName,
      type: fileType,
    };
  } catch (dataUrlErr) {
    throw new Error('Upload failed: Unable to process file.');
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