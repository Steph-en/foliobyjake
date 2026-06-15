import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { MediaAsset } from '../../types';
import {
  Search, Link as LinkIcon, Trash2, Copy, Check, ExternalLink, Film, Image as ImageIcon, Plus, ShieldAlert, Upload, X
} from 'lucide-react';
import { motion } from 'motion/react';
import ConfirmModal from './ConfirmModal';

export default function MediaManager() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // File upload state & status
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localAssetName, setLocalAssetName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Link import form state
  const [assetUrl, setAssetUrl] = useState('');
  const [assetName, setAssetName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDeleteMedia, setConfirmDeleteMedia] = useState<{ id: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const data = await api.getMedia();
      setMedia(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopyLink = (url: string, id: string) => {
    const fullUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.mp4', '.webm', '.ogg', '.mov'];

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    const isImage = allowedImageTypes.includes(fileType) || fileType.startsWith('image/');
    const isVideo = allowedVideoTypes.includes(fileType) || fileType.startsWith('video/');

    if (!isImage && !isVideo) {
      return {
        isValid: false,
        error: 'Unsupported file type. Only formats like JPEG, PNG, WEBP, GIF, SVG, BMP, MP4, WEBM, OGG, and MOV are supported.'
      };
    }

    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return {
        isValid: false,
        error: 'Unsupported extension. Supported Extensions: JPEG, PNG, WEBP, GIF, SVG, BMP, MP4, WEBM, OGG, MOV.'
      };
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max limit is 50MB.`
      };
    }

    return { isValid: true };
  };

  const handleImportAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetUrl.trim() || !assetName.trim()) return;
    setError('');
    setSuccess('');

    try {
      if (!assetUrl.startsWith('http://') && !assetUrl.startsWith('https://') && !assetUrl.startsWith('/')) {
        setError('Please enter a valid URL.');
        return;
      }

      await api.uploadMedia({
        url: assetUrl.trim(),
        name: assetName.trim()
      });

      setAssetUrl('');
      setAssetName('');
      setSuccess('Asset registered successfully!');
      fetchMedia();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to import media asset reference.');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setError('');
    setSuccess('');
    setIsUploading(true);
    setUploadProgress(0);

    const displayName = localAssetName.trim() || selectedFile.name;

    try {
      await api.uploadMediaFile(selectedFile, displayName, (percent) => {
        setUploadProgress(percent);
      });
      setSelectedFile(null);
      setLocalAssetName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSuccess('Media file uploaded successfully!');
      fetchMedia();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload media file.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');
    setSuccess('');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file. Please select a supported image or video file under 50MB.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      if (!localAssetName) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setLocalAssetName(baseName);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file. Please select a supported image or video file under 50MB.');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setSelectedFile(file);
      if (!localAssetName) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setLocalAssetName(baseName);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDeleteMedia({ id, name });
  };

  const executeDelete = async (id: string) => {
    try {
      await api.deleteMedia(id);
      fetchMedia();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMedia = media.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center p-20 animate-fade-in">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in text-zinc-200">
      
      <div>
        <h2 className="text-2xl uppercase tracking-tight font-display">ASSETS MANAGER</h2>
        <p className="text-xs text-zinc-500 mt-1 font-mono">Curate optimized Cloudinary videos, image hooks, and mock templates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Upload/Import side panel */}
        <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 h-fit space-y-6">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Add New Media Asset</h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-relaxed">
              Upload local image/video files, or register external URL references to curate your dynamic library.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900 text-red-400 text-xs font-mono rounded-xl flex items-center gap-2">
              <ShieldAlert size={14} className="shrink-0" />
              <span className="text-[11px] leading-snug">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900 text-emerald-400 text-xs font-mono rounded-xl">
              {success}
            </div>
          )}

          {/* SECTION A: Local File Upload */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2">
              <Upload size={12} className="text-zinc-400" />
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold">1. Upload Local File</h4>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`relative px-4 py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-white bg-white/5'
                    : selectedFile
                    ? 'border-zinc-700 bg-zinc-950'
                    : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40 bg-zinc-900/10'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                    {selectedFile.type.startsWith('image/') ? (
                      <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden border border-zinc-850 bg-zinc-900">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="chosen visual preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 mx-auto rounded-lg border border-zinc-850 bg-zinc-900 flex items-center justify-center text-zinc-500">
                        <Film size={24} />
                      </div>
                    )}
                    <div className="text-[10px] font-mono text-zinc-300">
                      <p className="font-bold truncate max-w-full px-2">{selectedFile.name}</p>
                      <p className="text-zinc-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setLocalAssetName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="mx-auto px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] uppercase tracking-wider font-mono hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X size={10} />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl w-fit mx-auto text-zinc-500">
                      <Upload size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-300 font-medium">Click to upload or drag & drop</p>
                      <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Supports Image / Video formats</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Display Name</label>
                  <input
                    type="text"
                    required
                    value={localAssetName}
                    onChange={(e) => setLocalAssetName(e.target.value)}
                    placeholder="e.g. Hero Slide Picture"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              )}

              {/* Progress Bar Component */}
              {isUploading && (
                <div className="space-y-2 mt-4 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Uploading chunk...
                    </span>
                    <span className="font-bold text-white">{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <motion.div
                      className="h-full bg-linear-to-r from-emerald-500 to-teal-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    />
                  </div>
                  {selectedFile && (
                    <div className="text-[9px] text-zinc-500 text-right">
                      {Math.round((uploadProgress / 100) * selectedFile.size / 1024 / 1024 * 10) / 10} MB / {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  selectedFile && !isUploading
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-850 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-pulse rounded-full h-3 w-3 border-2 border-zinc-600 border-t-white" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload File
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Divider line block */}
          <div className="flex items-center gap-2 my-8">
            <div className="grow h-px bg-zinc-900" />
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">OR REGISTRATION LINK</span>
            <div className="grow h-px bg-zinc-900" />
          </div>

          {/* SECTION B: Remote URL Registration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LinkIcon size={12} className="text-zinc-400" />
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold">2. Import Link</h4>
            </div>

            <form onSubmit={handleImportAsset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Display Name</label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. Hero Motion Video"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Absolute File URL</label>
                <input
                  type="url"
                  required
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-white"
              >
                <Plus size={14} />
                Register Asset
              </button>
            </form>
          </div>
        </div>

        {/* Media items container */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-650">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter assets by name, extension or source URL..."
              className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredMedia.map((item) => {
              const mimeVid = item.type === 'video' || item.url.includes('/video/') || item.url.endsWith('.mp4');
              return (
                <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-colors flex flex-col justify-between">
                  
                  {/* Visual cell preview */}
                  <div className="aspect-video bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                    {mimeVid ? (
                      <video src={item.url} muted controls={false} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    <span className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-[9px] font-mono tracking-widest uppercase text-zinc-400 flex items-center gap-1">
                      {mimeVid ? <Film size={10} /> : <ImageIcon size={10} />}
                      {mimeVid ? 'video' : 'photo'}
                    </span>
                  </div>

                  {/* Labels and values info */}
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white truncate">{item.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono truncate mt-1">{item.url}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyLink(item.url, item.id)}
                        className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-350 rounded-lg text-[10px] font-mono uppercase tracking-wider hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-white"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            Get URL
                          </>
                        )}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-colors flex items-center justify-center"
                        title="Open source link in tab"
                      >
                        <ExternalLink size={11} />
                      </a>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="py-1.5 px-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="De-register asset link"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredMedia.length === 0 && (
              <div className="col-span-full py-16 text-center bg-zinc-950 border border-zinc-900 rounded-2xl">
                <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">No matching media files found</p>
              </div>
            )}
          </div>

        </div>

      </div>

      <ConfirmModal
        isOpen={confirmDeleteMedia !== null}
        onClose={() => setConfirmDeleteMedia(null)}
        onConfirm={() => confirmDeleteMedia && executeDelete(confirmDeleteMedia.id)}
        title="Remove Asset"
        message={`Are you sure you want to remove "${confirmDeleteMedia?.name}" from your active media logs?`}
        confirmText="Remove Asset"
        isDanger={true}
      />
    </div>
  );
}