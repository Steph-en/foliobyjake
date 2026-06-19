import React, { useState, useEffect } from 'react';
import { smartUpload } from '../../lib/uploadHandler';
import { Trash2, Upload, Plus, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  longDescription: string;
  client: string;
  year: string;
  role: string;
  previewImage?: string;
  previewVideo?: string;
  heroImage?: string;
  heroVideo?: string;
  gallery: string[];
  status: 'draft' | 'published';
  isFeatured: boolean;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
  sections?: any[];
}

interface EditorState {
  loading: boolean;
  saving: boolean;
  uploadingGallery: boolean;
  error: string;
  success: string;
}

interface Props {
  projectId?: number;
  onSave?: (project: Project) => void;
  onCancel?: () => void;
}

export function ProjectEditor({ projectId, onSave, onCancel }: Props) {
  const [project, setProject] = useState<Project>({
    id: 0,
    name: '',
    slug: '',
    category: 'Graphic Design',
    description: '',
    longDescription: '',
    client: '',
    year: new Date().getFullYear().toString(),
    role: '',
    previewImage: '',
    heroImage: '',
    gallery: [],
    status: 'draft',
    isFeatured: false,
    views: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoOgImage: ''
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [state, setState] = useState<EditorState>({
    loading: false,
    saving: false,
    uploadingGallery: false,
    error: '',
    success: ''
  });

  // ── Load Project & Categories ──
  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

        // Load categories
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats.map((c: any) => c.name));
        }

        // Load project if editing
        if (projectId) {
          const projRes = await fetch(`/api/projects/${projectId}`);
          if (projRes.ok) {
            const proj = await projRes.json();
            setProject(proj);
          }
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to load data'
        }));
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, [projectId]);

  // ── Generate slug from name ──
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // ── Handle field changes ──
  const updateField = (field: keyof Project, value: any) => {
    setProject(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug if name changes
      if (field === 'name') {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  // ── Handle gallery file upload ──
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, uploadingGallery: true, error: '' }));

    try {
      const displayName = `${project.name} - ${file.name.replace(/\.[^/.]+$/, '')}`;
      console.log('[ProjectEditor] Gallery upload:', { filename: file.name, displayName });

      const asset = await smartUpload(file, displayName);

      setProject(prev => ({
        ...prev,
        gallery: [...prev.gallery, asset.url]
      }));

      setState(prev => ({
        ...prev,
        success: `✓ Added to gallery: ${asset.name}`
      }));

      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
      e.currentTarget.value = '';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('[ProjectEditor] Gallery upload error:', err);
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      setState(prev => ({ ...prev, uploadingGallery: false }));
    }
  };

  // ── Handle preview image upload ──
  const handlePreviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, saving: true, error: '' }));

    try {
      const asset = await smartUpload(file, `${project.name} - Preview`);
      updateField('previewImage', asset.url);
      setState(prev => ({
        ...prev,
        success: '✓ Preview image updated'
      }));
      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2000);
      e.currentTarget.value = '';
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Upload failed'
      }));
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  // ── Handle hero image upload ──
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, saving: true, error: '' }));

    try {
      const asset = await smartUpload(file, `${project.name} - Hero`);
      updateField('heroImage', asset.url);
      setState(prev => ({
        ...prev,
        success: '✓ Hero image updated'
      }));
      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2000);
      e.currentTarget.value = '';
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Upload failed'
      }));
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  // ── Save project ──
  const handleSave = async () => {
    if (!project.name.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Project name is required'
      }));
      return;
    }

    setState(prev => ({ ...prev, saving: true, error: '' }));

    try {
      const method = projectId ? 'PUT' : 'POST';
      const endpoint = projectId ? `/api/projects/${projectId}` : '/api/projects';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });

      if (response.ok) {
        const savedProject = await response.json();
        setState(prev => ({
          ...prev,
          success: `✓ Project ${projectId ? 'updated' : 'created'} successfully`
        }));

        if (onSave) {
          onSave(savedProject);
        }

        setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2000);
      } else {
        throw new Error('Failed to save project');
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Save failed'
      }));
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-400 mx-auto mb-4" size={40} />
          <p className="text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {projectId ? 'Edit Project' : 'Create Project'}
            </h1>
            <p className="text-slate-400">
              {projectId ? 'Update your project details' : 'Add a new portfolio project'}
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Messages */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-3 text-red-300">
            <AlertCircle size={20} />
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-3 text-green-300">
            <CheckCircle size={20} />
            {state.success}
          </div>
        )}

        {/* Form */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 space-y-8">
          {/* Basic Info */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Project Name *</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="e.g., Brand Identity Project"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={project.slug}
                  onChange={e => updateField('slug', e.target.value)}
                  placeholder="project-slug"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-slate-500 text-xs mt-1">Auto-generated from project name</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <select
                    value={project.category}
                    onChange={e => updateField('category', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Year</label>
                  <input
                    type="text"
                    value={project.year}
                    onChange={e => updateField('year', e.target.value)}
                    placeholder="2025"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Client</label>
                  <input
                    type="text"
                    value={project.client}
                    onChange={e => updateField('client', e.target.value)}
                    placeholder="Client name"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Your Role</label>
                  <input
                    type="text"
                    value={project.role}
                    onChange={e => updateField('role', e.target.value)}
                    placeholder="e.g., Lead Designer"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Descriptions */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">Descriptions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Short Description</label>
                <textarea
                  value={project.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="Brief overview (shown in listings)"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Long Description</label>
                <textarea
                  value={project.longDescription}
                  onChange={e => updateField('longDescription', e.target.value)}
                  placeholder="Detailed project description (shown on project page)"
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">Images</h2>
            <div className="space-y-6">
              {/* Preview Image */}
              <div>
                <label className="block text-white font-medium mb-3">Preview Image (Listing Thumbnail)</label>
                {project.previewImage && (
                  <div className="mb-4 relative w-48 h-32 rounded-lg overflow-hidden border border-slate-600">
                    <img
                      src={project.previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => updateField('previewImage', '')}
                      className="absolute top-2 right-2 p-1 bg-red-600 rounded hover:bg-red-700 text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                <label className="block">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                    <p className="text-slate-300 text-sm">
                      {state.saving ? 'Uploading...' : 'Click to upload preview image'}
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={handlePreviewImageUpload}
                    accept="image/*"
                    disabled={state.saving}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Hero Image */}
              <div>
                <label className="block text-white font-medium mb-3">Hero Image (Project Page)</label>
                {project.heroImage && (
                  <div className="mb-4 relative w-full h-48 rounded-lg overflow-hidden border border-slate-600">
                    <img
                      src={project.heroImage}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => updateField('heroImage', '')}
                      className="absolute top-2 right-2 p-1 bg-red-600 rounded hover:bg-red-700 text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                <label className="block">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                    <p className="text-slate-300 text-sm">
                      {state.saving ? 'Uploading...' : 'Click to upload hero image'}
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={handleHeroImageUpload}
                    accept="image/*"
                    disabled={state.saving}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">Gallery</h2>

            {project.gallery.length > 0 && (
              <div className="mb-6 grid grid-cols-3 gap-4">
                {project.gallery.map((url, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-600 aspect-video">
                    {url.includes('/video/') || url.endsWith('.mp4') ? (
                      <video src={url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() =>
                        updateField(
                          'gallery',
                          project.gallery.filter((_, i) => i !== idx)
                        )
                      }
                      className="absolute top-2 right-2 p-1 bg-red-600 rounded hover:bg-red-700 text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="block">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Plus className="mx-auto mb-2 text-slate-400" size={24} />
                <p className="text-slate-300 text-sm">
                  {state.uploadingGallery ? 'Uploading...' : 'Click to add gallery images'}
                </p>
              </div>
              <input
                type="file"
                onChange={handleGalleryUpload}
                accept="image/*,video/*"
                disabled={state.uploadingGallery}
                className="hidden"
              />
            </label>
          </section>

          {/* SEO */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">SEO</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={project.seoTitle}
                onChange={e => updateField('seoTitle', e.target.value)}
                placeholder="SEO Title"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={project.seoDescription}
                onChange={e => updateField('seoDescription', e.target.value)}
                placeholder="SEO Meta Description"
                rows={2}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <input
                type="text"
                value={project.seoKeywords}
                onChange={e => updateField('seoKeywords', e.target.value)}
                placeholder="SEO Keywords (comma-separated)"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </section>

          {/* Status */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">Status</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.status === 'published'}
                    onChange={e =>
                      updateField('status', e.target.checked ? 'published' : 'draft')
                    }
                    className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-white font-medium">
                    {project.status === 'published' ? (
                      <>
                        <Eye className="inline mr-2" size={16} /> Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="inline mr-2" size={16} /> Draft
                      </>
                    )}
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.isFeatured}
                    onChange={e => updateField('isFeatured', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-white font-medium">⭐ Featured Project</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex gap-4 justify-end">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={state.saving || !project.name.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            {state.saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {projectId ? 'Update Project' : 'Create Project'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectEditor;