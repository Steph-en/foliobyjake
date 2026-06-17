import React, { useState, useEffect } from 'react';
import { smartUpload, getUploadEnvironmentInfo } from '@/lib/uploadHandler';
import { Trash2, Upload, Link as LinkIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  size: string;
  createdAt: string;
}

interface UploadState {
  isLoading: boolean;
  error: string;
  progress: number;
}

interface TabType {
  id: 'upload' | 'url' | 'library';
  label: string;
}

const TABS: TabType[] = [
  { id: 'upload', label: 'Upload File' },
  { id: 'url', label: 'Add URL' },
  { id: 'library', label: 'Media Library' }
];

export function MediaManager() {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'library'>('library');
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    isLoading: false,
    error: '',
    progress: 0
  });
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [mediaLoading, setMediaLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // ── Fetch Media Library ──
  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setMediaLoading(true);
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        setMedia(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setUploadState(prev => ({
        ...prev,
        error: 'Failed to load media library'
      }));
    } finally {
      setMediaLoading(false);
    }
  };

  // ── Handle File Upload ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setUploadState({
      isLoading: true,
      error: '',
      progress: 0
    });

    try {
      // Extract filename without extension for display
      const displayName = nameInput || file.name.replace(/\.[^/.]+$/, '');

      console.log('[MediaManager] Uploading:', {
        filename: file.name,
        displayName,
        size: file.size,
        type: file.type,
        env: getUploadEnvironmentInfo()
      });

      // Use smartUpload (auto-routes to Cloudinary or local)
      const asset = await smartUpload(file, displayName);

      console.log('[MediaManager] Upload successful:', asset);

      // Save to backend
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: asset.url,
          name: asset.name,
          type: asset.type
        })
      });

      if (response.ok) {
        const newAsset = await response.json();
        setMedia(prev => [newAsset, ...prev]);
        setSuccessMessage(`✓ ${asset.name} uploaded successfully`);
        setNameInput('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);

        // Reset input
        e.currentTarget.value = '';
      } else {
        throw new Error('Failed to save asset to library');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('[MediaManager] Upload error:', err);
      setUploadState(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      setUploadState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  // ── Handle URL Input ──
  const handleAddUrl = async () => {
    if (!urlInput.trim()) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please enter a URL'
      }));
      return;
    }

    if (!nameInput.trim()) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please enter a name'
      }));
      return;
    }

    setUploadState({
      isLoading: true,
      error: '',
      progress: 0
    });

    try {
      // Determine type from URL
      const isVideo = /\.(mp4|webm|mov|avi|m3u8)$/i.test(urlInput) || urlInput.includes('/video/');
      const type: 'image' | 'video' = isVideo ? 'video' : 'image';

      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlInput,
          name: nameInput,
          type
        })
      });

      if (response.ok) {
        const newAsset = await response.json();
        setMedia(prev => [newAsset, ...prev]);
        setSuccessMessage(`✓ ${nameInput} added successfully`);
        setUrlInput('');
        setNameInput('');

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to save asset');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add URL';
      setUploadState(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      setUploadState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  // ── Handle Delete ──
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMedia(prev => prev.filter(m => m.id !== id));
        setDeleteConfirm(null);
        setSuccessMessage('✓ Asset deleted');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setUploadState(prev => ({
        ...prev,
        error: 'Failed to delete asset'
      }));
    }
  };

  // ── Get Thumbnail URL ──
  const getThumbnail = (asset: MediaAsset) => {
    if (asset.type === 'image') {
      return asset.url;
    }
    // For videos, try to get a thumbnail from Cloudinary or show a placeholder
    if (asset.url.includes('cloudinary')) {
      return asset.url.replace('/video/', '/image/').replace(/\.[^.]+$/, '.jpg');
    }
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Media Manager</h1>
          <p className="text-slate-400">Upload and manage your portfolio assets</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-3 text-green-300">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {uploadState.error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-3 text-red-300">
            <AlertCircle size={20} />
            {uploadState.error}
          </div>
        )}

        {/* ── TAB: Upload File ── */}
        {activeTab === 'upload' && (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="max-w-2xl">
              <label className="block mb-4">
                <span className="text-white font-medium mb-2 block">Asset Name (optional)</span>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g., Hero Image, Logo Animation"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-white font-medium mb-4 block">Choose File</span>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadState.isLoading}
                    accept="image/*,video/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <Upload className="mx-auto mb-4 text-slate-400" size={40} />
                    <p className="text-white font-medium mb-1">
                      {uploadState.isLoading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-slate-400 text-sm">PNG, JPG, GIF, MP4, MOV (max 100MB)</p>
                  </div>
                </div>
              </label>

              {uploadState.isLoading && (
                <div className="mt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="animate-spin text-blue-400" size={20} />
                    <span className="text-slate-300">Uploading {uploadState.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Add URL ── */}
        {activeTab === 'url' && (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="max-w-2xl">
              <label className="block mb-4">
                <span className="text-white font-medium mb-2 block">Asset Name</span>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g., Cloudinary Image"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block mb-6">
                <span className="text-white font-medium mb-2 block">Asset URL</span>
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <button
                onClick={handleAddUrl}
                disabled={uploadState.isLoading || !urlInput.trim() || !nameInput.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                {uploadState.isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Adding...
                  </>
                ) : (
                  <>
                    <LinkIcon size={18} />
                    Add to Library
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: Media Library ── */}
        {activeTab === 'library' && (
          <div>
            {mediaLoading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin text-blue-400 mx-auto mb-4" size={40} />
                <p className="text-slate-400">Loading media library...</p>
              </div>
            ) : media.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
                <Upload className="mx-auto mb-4 text-slate-500" size={40} />
                <p className="text-slate-400 text-lg">No media uploaded yet</p>
                <p className="text-slate-500 mt-2">Use the Upload or Add URL tabs to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map(asset => (
                  <div
                    key={asset.id}
                    className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      {asset.type === 'image' ? (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <video
                          src={asset.url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      {asset.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/60 transition-colors">
                          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-0 h-0 border-l-6 border-r-3 border-t-4 border-b-4 border-l-white border-r-transparent border-t-transparent border-b-transparent ml-1" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-white font-medium truncate mb-1">{asset.name}</h3>
                      <p className="text-slate-400 text-sm mb-3">
                        {asset.type === 'image' ? '🖼️ Image' : '🎥 Video'} • {asset.size}
                      </p>

                      {/* URL Copy */}
                      <input
                        type="text"
                        value={asset.url}
                        readOnly
                        className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-300 text-xs font-mono mb-3 focus:outline-none"
                      />

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(asset.url).then(() =>
                              setSuccessMessage('✓ URL copied')
                            )
                          }
                          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
                        >
                          Copy URL
                        </button>
                        <button
                          onClick={() =>
                            window.open(asset.url, '_blank')
                          }
                          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(asset.id)}
                          className="px-3 py-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {deleteConfirm === asset.id && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                          <p className="text-white mb-4 font-medium">Delete "{asset.name}"?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaManager;