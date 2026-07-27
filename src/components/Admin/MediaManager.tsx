import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { MediaAsset } from '../../types';
import { smartUpload, getUploadEnvironmentInfo } from '../../lib/uploadHandler';
import { Trash2, Upload, Link as LinkIcon, Loader2, AlertCircle, CheckCircle, Search, ExternalLink, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

interface UploadState {
  isLoading: boolean;
  error: string;
  progress: number;
}

export function MediaManager() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      const data = await api.getMedia();
      setMedia(data);
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
      const newAsset = await api.uploadMedia({
        url: asset.url,
        name: asset.name,
        type: asset.type
      });

      setMedia(prev => [newAsset, ...prev]);
      setSuccessMessage(`✓ ${asset.name} uploaded successfully`);
      setNameInput('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset input
      e.currentTarget.value = '';
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

      const newAsset = await api.uploadMedia({
        url: urlInput,
        name: nameInput,
        type
      });

      setMedia(prev => [newAsset, ...prev]);
      setSuccessMessage(`✓ ${nameInput} added successfully`);
      setUrlInput('');
      setNameInput('');

      setTimeout(() => setSuccessMessage(''), 3000);
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
      await api.deleteMedia(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      setDeleteConfirm(null);
      setSuccessMessage('✓ Asset deleted');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('Delete failed:', err);
      setUploadState(prev => ({
        ...prev,
        error: 'Failed to delete asset'
      }));
    }
  };

  // ── Filtered Media based on user input search query ──
  const filteredMedia = media.filter(asset => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      asset.name?.toLowerCase().includes(query) ||
      asset.url?.toLowerCase().includes(query) ||
      asset.type?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in text-zinc-100 font-sans min-h-screen bg-black pb-12">
      {/* 1. Header Layout */}
      <div className="pb-6 border-b border-zinc-900/80">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-white font-sans">ASSETS MANAGER</h1>
        <p className="text-xs text-zinc-500 mt-1 font-sans">
          Curate optimized Cloudinary videos, image hooks, and mock templates
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-mono">
          <CheckCircle size={14} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {uploadState.error && (
        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-center gap-2.5 text-red-400 text-xs font-mono">
          <AlertCircle size={14} className="shrink-0" />
          <span>{uploadState.error}</span>
        </div>
      )}

      {/* 2. Main Double-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: ADD NEW MEDIA ASSET form */}
        <div className="lg:col-span-4 bg-[#09090b] border border-zinc-900 rounded-3xl p-6 space-y-6">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-widest text-zinc-200 uppercase">ADD NEW MEDIA ASSET</h2>
            <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
              Upload local image/video files, or register external URL references to curate your dynamic library.
            </p>
          </div>

          {/* Section 1: UPLOAD LOCAL FILE */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
              <span>📤</span>
              <span>1. UPLOAD LOCAL FILE</span>
            </div>

            <div className="relative group">
              {/* Invisible file input covering the area */}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploadState.isLoading}
                accept="image/*,video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
              />
              
              {/* Box dropzone */}
              <div className="border border-dashed border-zinc-800 bg-[#121214]/20 rounded-2xl p-7 text-center group-hover:border-zinc-700 transition-colors relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#121214] border border-zinc-900 flex items-center justify-center mx-auto mb-3">
                  <Upload className="text-zinc-500" size={16} />
                </div>
                <p className="text-zinc-200 text-xs font-semibold">Click to upload or drag & drop</p>
                <p className="text-[9px] font-mono text-zinc-505 mt-1 tracking-wider uppercase">SUPPORTS IMAGE / VIDEO FORMATS</p>
              </div>

              {/* Upload Button */}
              <div className="w-full border border-zinc-800 hover:border-zinc-700 bg-transparent text-zinc-400 font-mono tracking-widest text-[9px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 relative z-10">
                <Upload size={12} className="text-zinc-500" />
                <span>UPLOAD FILE</span>
              </div>
            </div>

            {/* Spinner Progress bar if uploading */}
            {uploadState.isLoading && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <Loader2 className="animate-spin text-white" size={12} />
                  <span>Configuring assets directory...</span>
                </div>
              </div>
            )}
          </div>

          {/* Separation Divider */}
          <div className="flex items-center gap-3 text-[9px] font-mono tracking-widest text-zinc-600 uppercase select-none">
            <span className="h-px grow bg-zinc-900" />
            <span>OR REGISTRATION LINK</span>
            <span className="h-px grow bg-zinc-900" />
          </div>

          {/* Section 2: IMPORT LINK */}
          <div className="space-y-4">
            <div className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
              <span>🔗</span>
              <span>2. IMPORT LINK</span>
            </div>

            {/* Field: Display Name */}
            <div>
              <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-1.5 uppercase">DISPLAY NAME</label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="e.g. Hero Motion Video"
                className="w-full px-4 py-3 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
              />
            </div>

            {/* Field: Absolute File URL */}
            <div>
              <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-1.5 uppercase">ABSOLUTE FILE URL</label>
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full px-4 py-3 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
              />
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleAddUrl}
              disabled={uploadState.isLoading || !urlInput.trim() || !nameInput.trim()}
              className="w-full bg-white text-black hover:bg-zinc-250 disabled:opacity-30 disabled:hover:bg-white text-xs font-bold uppercase tracking-widest py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans"
            >
              <span>+ REGISTER ASSET</span>
            </button>
          </div>
        </div>

        {/* Right Column: Search Box & Dynamic Cards Grid */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. Search Filtering Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter assets by name, extension or source URL..."
              className="w-full pl-11 pr-4 py-3.5 bg-[#09090b] border border-zinc-900 rounded-xl text-zinc-100 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
            />
          </div>

          {/* B. Media Grid / Empty / Loader Container */}
          {mediaLoading ? (
            <div className="text-center py-24 flex flex-col items-center gap-4 bg-[#09090b]/40 border border-zinc-900 rounded-3xl">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/90 border-t-transparent" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Retrieving media collections from directory...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="bg-[#09090b]/40 border border-zinc-900 rounded-3xl p-20 text-center space-y-3">
              <Upload className="mx-auto text-zinc-700" size={32} />
              <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">No matching assets found</p>
              <p className="text-zinc-650 text-xs">Verify your filters or upload a new record on the side panel</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMedia.map(asset => {
                const isVideo = asset.type === 'video';
                return (
                  <div
                    key={asset.id}
                    className="bg-[#09090b] border border-[#141418] rounded-2xl p-3.5 hover:border-zinc-800 transition-all group relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Responsive Frame container */}
                      <div className="relative min-h-40 max-h-56 bg-black rounded-lg overflow-hidden border border-zinc-950 flex items-center justify-center p-1">
                        {/* Type badge tag on top left */}
                        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 font-mono uppercase text-[8px] font-extrabold tracking-widest">
                          {isVideo ? (
                            <span className="bg-zinc-900/90 border border-zinc-800 text-cyan-400 px-2 py-1 rounded flex items-center gap-1 backdrop-blur-md">
                              <VideoIcon size={8} /> VIDEO
                            </span>
                          ) : (
                            <span className="bg-[#c4f822] text-black px-2 py-1 rounded flex items-center gap-1 font-black">
                              <ImageIcon size={8} /> PHOTO
                            </span>
                          )}
                        </div>

                        {/* Preview Loader */}
                        {isVideo ? (
                          <video
                            src={asset.url}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-contain group-hover:scale-103 transition-transform duration-300"
                          />
                        ) : (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain group-hover:scale-103 transition-transform duration-300"
                          />
                        )}

                        {/* Video custom center overlay indicator */}
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/45 transition-colors duration-300">
                            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md">
                              <span className="w-0 h-0 border-l-[6px] border-y-4px border-l-white border-y-transparent ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Display Info */}
                      <div className="mt-3.5 leading-snug">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-100 truncate px-1" title={asset.name}>
                          {asset.name}
                        </h3>
                        <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5 px-1" title={asset.url}>
                          {asset.url}
                        </p>
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="flex gap-2 items-center mt-4 pt-2 border-t border-zinc-900/40">
                      {/* Copy link option */}
                      <button
                        onClick={() => {
                          const urlToCopy = asset.url;
                          navigator.clipboard.writeText(urlToCopy).then(() => {
                            setSuccessMessage('✓ URL copied to clipboard');
                            setTimeout(() => setSuccessMessage(''), 2000);
                          });
                        }}
                        className="flex-1 py-2 px-3 bg-[#121214] border border-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer text-[9px] uppercase tracking-widest font-mono rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <span>GET URL</span>
                      </button>

                      {/* External view option */}
                      <button
                        onClick={() => window.open(asset.url, '_blank')}
                        className="w-9 h-9 border border-zinc-900 bg-[#121214] text-zinc-450 hover:text-white transition-colors cursor-pointer rounded-lg flex items-center justify-center"
                        title="Open asset externally"
                      >
                        <ExternalLink size={12} />
                      </button>

                      {/* Permanent removal option */}
                      <button
                        onClick={() => setDeleteConfirm(asset.id)}
                        className="w-9 h-9 border border-zinc-900 bg-[#121214] text-red-400/80 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900 transition-colors cursor-pointer rounded-lg flex items-center justify-center"
                        title="Delete asset from catalog"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Standard overlay confirm screen */}
                    {deleteConfirm === asset.id && (
                      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-30 rounded-2xl">
                        <div className="text-center space-y-4 max-w-50">
                          <p className="text-zinc-300 text-[10px] font-mono uppercase tracking-wider">Delete "{asset.name}"?</p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase tracking-widest text-[9px] rounded-lg cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white font-mono uppercase tracking-widest text-[9px] rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MediaManager;