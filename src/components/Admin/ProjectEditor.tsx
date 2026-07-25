import React, { useState, useEffect } from 'react';
import { smartUpload } from '../../lib/uploadHandler';
import { 
  Trash2, 
  Upload, 
  Plus, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  Save, 
  Image as ImageIcon, 
  Video as VideoIcon,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface CaseStudySection {
  id: string;
  type: 'text' | 'side-by-side' | 'asymmetric-split';
  content: {
    textHeader?: string;
    textBody?: string;
    images?: string[];
    layoutType?: 'asymmetric-left' | 'asymmetric-right' | 'equal';
  };
  order: number;
}

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
  sections?: CaseStudySection[];
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
  const [activeTab, setActiveTab] = useState<'primary' | 'ports' | 'dynamic' | 'seo'>('primary');
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
    previewVideo: '',
    heroImage: '',
    heroVideo: '',
    gallery: [],
    status: 'draft',
    isFeatured: false,
    views: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoOgImage: '',
    sections: []
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [state, setState] = useState<EditorState>({
    loading: false,
    saving: false,
    uploadingGallery: false,
    error: '',
    success: ''
  });
  
  // Auxiliary input for adding links directly to gallery
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

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
            setProject({
              ...proj,
              sections: proj.sections || []
            });
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
      if (field === 'name') {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  // ── 4 Dedicated asset port uploaders ──
  const handlePreviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, saving: true, error: '' }));
    try {
      const asset = await smartUpload(file, `${project.name} - Fallback Thumbnail`);
      updateField('previewImage', asset.url);
      setState(prev => ({ ...prev, success: '✓ Fallback image uploaded' }));
      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2500);
      e.currentTarget.value = '';
    } catch (err) {
      setState(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Upload failed' }));
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  const handlePreviewVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, saving: true, error: '' }));
    try {
      const asset = await smartUpload(file, `${project.name} - Grid Video Loop`);
      updateField('previewVideo', asset.url);
      setState(prev => ({ ...prev, success: '✓ Grid video loop uploaded' }));
      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2500);
      e.currentTarget.value = '';
    } catch (err) {
      setState(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Upload failed' }));
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, saving: true, error: '' }));
    try {
      const asset = await smartUpload(file, `${project.name} - Hero Image Landscape`);
      updateField('heroImage', asset.url);
      setState(prev => ({ ...prev, success: '✓ Hero image updated' }));
      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2500);
      e.currentTarget.value = '';
    } catch (err) {
      setState(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Upload failed' }));
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, saving: true, error: '' }));
    try {
      const asset = await smartUpload(file, `${project.name} - Hero Video Reel`);
      updateField('heroVideo', asset.url);
      setState(prev => ({ ...prev, success: '✓ Hero video reel updated' }));
      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2500);
      e.currentTarget.value = '';
    } catch (err) {
      setState(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Upload failed' }));
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  // ── Gallery additions ──
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, uploadingGallery: true, error: '' }));
    try {
      const displayName = `${project.name} - Gallery ${project.gallery.length + 1}`;
      const asset = await smartUpload(file, displayName);

      setProject(prev => ({
        ...prev,
        gallery: [...prev.gallery, asset.url]
      }));

      setState(prev => ({
        ...prev,
        success: `✓ Added to grid gallery: ${asset.name}`
      }));
      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
      e.currentTarget.value = '';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setState(prev => ({ ...prev, uploadingGallery: false }));
    }
  };

  const addGalleryLink = () => {
    if (!galleryUrlInput.trim()) return;
    setProject(prev => ({
      ...prev,
      gallery: [...prev.gallery, galleryUrlInput.trim()]
    }));
    setGalleryUrlInput('');
    setState(prev => ({ ...prev, success: '✓ Added link to grid gallery' }));
    setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2000);
  };

  // ── Dynamic Custom Blocks functions ──
  const addBlock = (type: 'text' | 'side-by-side' | 'asymmetric-split') => {
    const newBlock: CaseStudySection = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      content: {
        textHeader: '',
        textBody: '',
        images: type === 'text' ? [] : ['', ''],
        layoutType: type === 'asymmetric-split' ? 'asymmetric-left' : undefined
      },
      order: (project.sections?.length || 0) + 1
    };

    setProject(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newBlock]
    }));
  };

  const updateBlockContent = (id: string, key: string, value: any) => {
    setProject(prev => {
      const updated = (prev.sections || []).map(sec => {
        if (sec.id === id) {
          return {
            ...sec,
            content: {
              ...sec.content,
              [key]: value
            }
          };
        }
        return sec;
      });
      return { ...prev, sections: updated };
    });
  };

  const handleBlockImageUpload = async (blockId: string, imageIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, saving: true, error: '' }));
    try {
      const asset = await smartUpload(file, `${project.name} - block asset`);
      setProject(prev => {
        const updated = (prev.sections || []).map(sec => {
          if (sec.id === blockId) {
            const imgs = [...(sec.content.images || ['', ''])];
            imgs[imageIdx] = asset.url;
            return {
              ...sec,
              content: { ...sec.content, images: imgs }
            };
          }
          return sec;
        });
        return { ...prev, sections: updated };
      });
      setState(prev => ({ ...prev, success: '✓ Section visual element uploaded' }));
      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2500);
      e.currentTarget.value = '';
    } catch (err) {
      setState(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Block upload failed' }));
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const secs = [...(project.sections || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= secs.length) return;

    const temp = secs[index];
    secs[index] = secs[targetIdx];
    secs[targetIdx] = temp;

    // Rescale ordering index
    const rescaled = secs.map((sec, i) => ({ ...sec, order: i + 1 }));
    setProject(prev => ({ ...prev, sections: rescaled }));
  };

  const deleteBlock = (id: string) => {
    setProject(prev => ({
      ...prev,
      sections: (prev.sections || []).filter(sec => sec.id !== id).map((sec, i) => ({ ...sec, order: i + 1 }))
    }));
  };

  // ── Core Save ──
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

        setTimeout(() => setState(prev => ({ ...prev, success: '' })), 2500);
      } else {
        throw new Error('Failed to save project records to server');
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Save transaction failed'
      }));
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
        <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Retrieving project compilation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-zinc-100 font-sans min-h-screen bg-black pb-12">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-900/80">
        <div className="flex items-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-10 h-10 bg-[#09090b] border border-zinc-900 hover:border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-900/50 transition-colors"
              title="Go back"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white font-sans">
              UPDATE SPECIFICATION
            </h1>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
              {projectId ? `Re-factoring active records: #${projectId}` : 'Establish a new portfolio record'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={state.saving || !project.name.trim()}
          className="bg-white text-black hover:bg-zinc-200 disabled:opacity-50 text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-xl transition-all cursor-pointer flex items-center gap-2 font-sans"
        >
          {state.saving ? (
            <>
              <Loader2 className="animate-spin text-black" size={14} />
              <span>SAVING...</span>
            </>
          ) : (
            <>
              <Save size={13} className="text-black" />
              <span>COMPILE & SAVE</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Notifications */}
      {state.error && (
        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-center gap-2.5 text-red-400 text-xs font-mono">
          <AlertCircle size={14} className="shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state.success && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-mono">
          <CheckCircle size={14} className="shrink-0" />
          <span>{state.success}</span>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div className="border-b border-zinc-900">
        <div className="flex flex-wrap items-center gap-x-8 -mb-px">
          {[
            { id: 'primary', label: 'PRIMARY DETAILS' },
            { id: 'ports', label: 'VIDEO & IMAGE PORTS' },
            { id: 'dynamic', label: 'DYNAMIC CONTENT BLOCKS' },
            { id: 'seo', label: 'SEO CONFIGS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 text-xs font-bold tracking-wider font-mono transition-all relative cursor-pointer ${
                activeTab === tab.id
                  ? 'text-white border-b border-white font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Subsections according to active selection ── */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-[28px] p-8 min-h-112.5">
        
        {/* TAB 1: PRIMARY DETAILS */}
        {activeTab === 'primary' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase">SECTION 1: GENERAL PARAMETERS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div>
                <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">PROJECT NAME *</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="e.g. VANT"
                  className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">CATEGORY *</label>
                <select
                  value={project.category}
                  onChange={e => updateField('category', e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono cursor-pointer h-11.5"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-zinc-950">{cat}</option>
                  ))}
                  {categories.length === 0 && (
                    <option value="Graphic Design" className="bg-zinc-950">Graphic Design</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Publish Status */}
              <div>
                <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">PUBLISH STATUS</label>
                <select
                  value={project.status}
                  onChange={e => updateField('status', e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono cursor-pointer h-11.5"
                >
                  <option value="published" className="bg-zinc-950">Published (Visible on site)</option>
                  <option value="draft" className="bg-zinc-950">Draft Mode (Hidden)</option>
                </select>
              </div>

              {/* Features List Inclusion Checkbox card layout */}
              <div className="pt-2">
                <label className="flex items-start gap-3.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={project.isFeatured}
                    onChange={e => updateField('isFeatured', e.target.checked)}
                    className="appearance-none shrink-0 w-5 h-5 bg-[#121214] border border-zinc-900 rounded-md checked:bg-white checked:border-white relative flex items-center justify-center after:content-['✓'] after:absolute after:text-[10px] after:text-black after:hidden checked:after:block mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="block text-[10px] font-mono tracking-widest text-zinc-100 uppercase font-extrabold">FEATURES LIST INCLUSION</span>
                    <span className="block text-[9px] text-zinc-500 font-mono mt-0.5">Toggle representation in homepage highlights</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Client, Year, Role block row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">CLIENT NAME</label>
                <input
                  type="text"
                  value={project.client}
                  onChange={e => updateField('client', e.target.value)}
                  placeholder="e.g. VANT"
                  className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">YEAR</label>
                <input
                  type="text"
                  value={project.year}
                  onChange={e => updateField('year', e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">ROLE/POSITION</label>
                <input
                  type="text"
                  value={project.role}
                  onChange={e => updateField('role', e.target.value)}
                  placeholder="e.g. Brand Identity Designer"
                  className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                />
              </div>
            </div>

            {/* Textarea: Summary */}
            <div>
              <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">DYNAMIC INTRO SUMMARY *</label>
              <textarea
                value={project.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder="A Brand Identity project..."
                rows={3}
                className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono resize-none leading-relaxed"
              />
            </div>

            {/* Textarea: Detailed context */}
            <div>
              <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">DETAILED CONTEXT & OVERVIEW *</label>
              <textarea
                value={project.longDescription}
                onChange={e => updateField('longDescription', e.target.value)}
                placeholder="This project translates..."
                rows={6}
                className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 2: VIDEO & IMAGE PORTS */}
        {activeTab === 'ports' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase">SECTION 2: ASSET LINKS HOOKING</h2>
            </div>

            {/* Asset Ports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Fallback Image with Local Upload Option */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">FALLBACK IMAGE URL</label>
                  <label className="text-[9px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer select-none">
                    <span>↑ LOCAL IMAGE</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePreviewImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={project.previewImage || ''}
                    onChange={e => updateField('previewImage', e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full pl-4 pr-11 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                  />
                  <ImageIcon size={14} className="absolute right-4 text-zinc-500" />
                </div>
              </div>

              {/* Grid Video Loop with Local Upload Option */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">GRID VIDEO LOOP URL (OPTIONAL)</label>
                  <label className="text-[9px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer select-none">
                    <span>↑ LOCAL VIDEO</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handlePreviewVideoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={project.previewVideo || ''}
                    onChange={e => updateField('previewVideo', e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full pl-4 pr-11 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                  />
                  <VideoIcon size={14} className="absolute right-4 text-zinc-500" />
                </div>
              </div>

              {/* Hero Image with Local Upload Option */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">HERO IMAGE URL (LANDSCAPE)</label>
                  <label className="text-[9px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer select-none">
                    <span>↑ LOCAL IMAGE</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={project.heroImage || ''}
                    onChange={e => updateField('heroImage', e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full pl-4 pr-11 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                  />
                  <ImageIcon size={14} className="absolute right-4 text-zinc-500" />
                </div>
              </div>

              {/* Hero Video Reel with Local Upload Option */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">HERO VIDEO REEL (OPTIONAL)</label>
                  <label className="text-[9px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer select-none">
                    <span>↑ LOCAL VIDEO</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleHeroVideoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={project.heroVideo || ''}
                    onChange={e => updateField('heroVideo', e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full pl-4 pr-11 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                  />
                  <VideoIcon size={14} className="absolute right-4 text-zinc-500" />
                </div>
              </div>

            </div>

            {/* Separation divider */}
            <div className="h-px bg-zinc-900/60 my-6" />

            {/* Gallery Collection Box */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">PROJECT GRID GALLERY COLLECTION</h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  Add, remove, and drag cards to configure display order.
                </p>
              </div>

              {/* Interactive controller row */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <input
                  type="text"
                  value={galleryUrlInput}
                  onChange={e => setGalleryUrlInput(e.target.value)}
                  placeholder="Paste direct URL to append to gallery collections..."
                  className="flex-1 px-4 py-3 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-100 placeholder-zinc-650 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                />
                
                <button
                  onClick={addGalleryLink}
                  disabled={!galleryUrlInput.trim()}
                  className="bg-white text-black hover:bg-zinc-200 font-sans font-bold uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl transition-all cursor-pointer disabled:opacity-30 flex items-center justify-center shrink-0"
                >
                  ADD ITEM LINK
                </button>

                <label className="border border-zinc-800 bg-zinc-900 hover:bg-zinc-805 hover:border-zinc-700 text-zinc-300 font-sans font-bold uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 select-none">
                  <Upload size={12} />
                  <span>UPLOAD FILE</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Active Spinner if Gallery element is installing */}
              {state.uploadingGallery && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 py-1">
                  <Loader2 className="animate-spin text-white" size={12} />
                  <span>Processing asset configuration...</span>
                </div>
              )}

              {/* Gallery Items Grid (Custom 6 column system matching screenshot 2) */}
              {project.gallery.length === 0 ? (
                <div className="border border-dashed border-zinc-900 bg-zinc-950/20 rounded-2xl p-10 text-center text-zinc-550 text-xs font-mono uppercase tracking-widest">
                  No images registered in grid collections yet
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-3">
                  {project.gallery.map((url, idx) => {
                    const isVideo = url.includes('/video/') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm');
                    return (
                      <div
                        key={idx}
                        className="bg-[#09090b] border border-[#141418] rounded-xl p-2.5 hover:border-zinc-800 transition-all group flex flex-col justify-between"
                      >
                        <div className="relative min-h-28 max-h-40 rounded-lg overflow-hidden bg-black border border-zinc-950 flex items-center justify-center p-1">
                          {isVideo ? (
                            <video
                              src={url}
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <img
                              src={url}
                              alt={`Item ${idx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          )}

                          {/* Mini visual indicator */}
                          <div className="absolute top-1.5 left-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-zinc-300 border border-zinc-800 backdrop-blur-xs">
                            {isVideo ? 'VIDEO' : 'IMAGE'}
                          </div>
                        </div>

                        {/* Control card footer row */}
                        <div className="flex items-center justify-between mt-2.5 px-0.5 select-none">
                          <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[50%]" title={url}>
                            {idx + 1}. {url.substring(url.lastIndexOf('/') + 1) || 'Asset'}
                          </span>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Move left */}
                            {idx > 0 && (
                              <button
                                onClick={() => {
                                  const updated = [...project.gallery];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx - 1];
                                  updated[idx - 1] = temp;
                                  updateField('gallery', updated);
                                }}
                                className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-[10px]"
                                title="Move Left"
                              >
                                ◀
                              </button>
                            )}

                            {/* Move right */}
                            {idx < project.gallery.length - 1 && (
                              <button
                                onClick={() => {
                                  const updated = [...project.gallery];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx + 1];
                                  updated[idx + 1] = temp;
                                  updateField('gallery', updated);
                                }}
                                className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-[10px]"
                                title="Move Right"
                              >
                                ▶
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => {
                                updateField(
                                  'gallery',
                                  project.gallery.filter((_, i) => i !== idx)
                                );
                              }}
                              className="text-zinc-600 hover:text-red-400 transition-colors p-0.5 cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 size={9} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: DYNAMIC CONTENT BLOCKS */}
        {activeTab === 'dynamic' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header section with buttons on far right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900/40 pb-4">
              <div>
                <h2 className="text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase">SECTION 3: CUSTOM PAGE ASSEMBLY BUILDER</h2>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Mix typography nodes, side-by-side splits & asymmetrical spans
                </p>
              </div>

              {/* Monospace Quick Addition buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => addBlock('text')}
                  className="bg-[#121214] border border-zinc-900 hover:border-zinc-700 text-zinc-300 font-mono text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={10} />
                  <span>T + TEXT NODE</span>
                </button>
                <button
                  onClick={() => addBlock('side-by-side')}
                  className="bg-[#121214] border border-zinc-900 hover:border-zinc-700 text-zinc-300 font-mono text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={10} />
                  <span>⚙ + SIDE-BY-SIDE</span>
                </button>
                <button
                  onClick={() => addBlock('asymmetric-split')}
                  className="bg-[#121214] border border-zinc-900 hover:border-zinc-700 text-zinc-300 font-mono text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={10} />
                  <span>📐 + ODD SPLIT</span>
                </button>
              </div>
            </div>

            {/* Condition: Empty Slate Layout */}
            {(!project.sections || project.sections.length === 0) ? (
              <div className="border border-dashed border-zinc-850 bg-zinc-950/20 rounded-2xl p-16 text-center select-none">
                <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  NO CUSTOM MODULAR LAYOUTS ARE DEFINED CURRENTLY.
                </p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-650 mt-1">
                  ADD BLOCKS FROM THE OPTIONS ABOVE.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {(project.sections || []).map((sec, idx) => {
                  return (
                    <div
                      key={sec.id}
                      className="bg-[#121214]/50 border border-zinc-900 rounded-2xl p-6 relative space-y-4"
                    >
                      {/* Section mini bar header with controller layout */}
                      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                        <span className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase font-bold">
                          BLOCK {idx + 1}: {sec.type === 'asymmetric-split' ? 'ODD SPLIT' : sec.type.toUpperCase()}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Move up */}
                          {idx > 0 && (
                            <button
                              onClick={() => moveBlock(idx, 'up')}
                              className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors cursor-pointer"
                              title="Move block up"
                            >
                              <ArrowUp size={11} />
                            </button>
                          )}
                          {/* Move down */}
                          {idx < (project.sections?.length || 0) - 1 && (
                            <button
                              onClick={() => moveBlock(idx, 'down')}
                              className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors cursor-pointer"
                              title="Move block down"
                            >
                              <ArrowDown size={11} />
                            </button>
                          )}
                          {/* Remove block */}
                          <button
                            onClick={() => deleteBlock(sec.id)}
                            className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded border border-transparent hover:border-red-900/20 transition-all cursor-pointer ml-1"
                            title="Delete content block"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Content block fields depending on type selection */}
                      {sec.type === 'text' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[8px] font-mono tracking-widest text-zinc-500 mb-1.5 uppercase">BLOCK TITLE / CONTEXT PREFIX</label>
                            <input
                              type="text"
                              value={sec.content.textHeader || ''}
                              onChange={e => updateBlockContent(sec.id, 'textHeader', e.target.value)}
                              placeholder="e.g. VISUAL METAPHOR"
                              className="w-full px-4 py-3 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-100 placeholder-zinc-700 focus:border-zinc-800 focus:outline-none transition-colors text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono tracking-widest text-zinc-500 mb-1.5 uppercase">BODY NARRATIVE CONTENT</label>
                            <textarea
                              value={sec.content.textBody || ''}
                              onChange={e => updateBlockContent(sec.id, 'textBody', e.target.value)}
                              placeholder="Type narrative markup content here..."
                              rows={4}
                              className="w-full px-4 py-3 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-100 placeholder-zinc-700 focus:border-zinc-800 focus:outline-none transition-colors text-xs font-mono resize-none leading-relaxed"
                            />
                          </div>
                        </div>
                      )}

                      {sec.type === 'side-by-side' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[0, 1].map(imageIdx => {
                            const url = sec.content.images?.[imageIdx] || '';
                            return (
                              <div key={imageIdx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="block text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
                                    {imageIdx === 0 ? 'LEFT LINK / VISUAL MEDIA' : 'RIGHT LINK / VISUAL MEDIA'}
                                  </label>
                                  <label className="text-[8px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer select-none">
                                    <span>↑ UPLOAD DECK</span>
                                    <input
                                      type="file"
                                      accept="image/*,video/*"
                                      onChange={e => handleBlockImageUpload(sec.id, imageIdx, e)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                                <input
                                  type="url"
                                  value={url}
                                  onChange={e => {
                                    const array = [...(sec.content.images || ['', ''])];
                                    array[imageIdx] = e.target.value;
                                    updateBlockContent(sec.id, 'images', array);
                                  }}
                                  placeholder="https://res.cloudinary.com/..."
                                  className="w-full px-4 py-3 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-100 placeholder-zinc-700 focus:border-zinc-800 focus:outline-none transition-colors text-xs font-mono"
                                />

                                {url && (
                                  <div className="relative min-h-24 max-h-36 rounded-lg overflow-hidden border border-zinc-900 mt-2 max-w-45 bg-black flex items-center justify-center p-1">
                                    {url.includes('/video/') || url.endsWith('.mp4') ? (
                                      <video src={url} className="w-full h-full object-contain" />
                                    ) : (
                                      <img src={url} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {sec.type === 'asymmetric-split' && (
                        <div className="space-y-4">
                          {/* Layout configurator */}
                          <div>
                            <label className="block text-[8px] font-mono tracking-widest text-zinc-500 mb-1.5 uppercase">LAYOUT STYLE CONFIGURATION</label>
                            <select
                              value={sec.content.layoutType || 'asymmetric-left'}
                              onChange={e => updateBlockContent(sec.id, 'layoutType', e.target.value)}
                              className="px-4 py-2.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 focus:border-zinc-800 focus:outline-none transition-colors text-xs font-mono cursor-pointer"
                            >
                              <option value="asymmetric-left" className="bg-zinc-950">Asymmetric Left Style (Primary Left 8/12, Secondary Right 4/12)</option>
                              <option value="asymmetric-right" className="bg-zinc-950">Asymmetric Right Style (Secondary Left 4/12, Primary Right 8/12)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[0, 1].map(imageIdx => {
                              const url = sec.content.images?.[imageIdx] || '';
                              return (
                                <div key={imageIdx} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="block text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
                                      {imageIdx === 0 ? 'PRIMARY MEDIA TARGET' : 'SUPPORTING MEDIA TARGET'}
                                    </label>
                                    <label className="text-[8px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer select-none">
                                      <span>↑ UPLOAD DECK</span>
                                      <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={e => handleBlockImageUpload(sec.id, imageIdx, e)}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                  <input
                                    type="url"
                                    value={url}
                                    onChange={e => {
                                      const array = [...(sec.content.images || ['', ''])];
                                      array[imageIdx] = e.target.value;
                                      updateBlockContent(sec.id, 'images', array);
                                    }}
                                    placeholder="https://res.cloudinary.com/..."
                                    className="w-full px-4 py-3 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-100 placeholder-zinc-700 focus:border-zinc-800 focus:outline-none transition-colors text-xs font-mono"
                                  />

                                  {url && (
                                    <div className="relative min-h-24 max-h-36 rounded-lg overflow-hidden border border-zinc-900 mt-2 max-w-45 bg-black flex items-center justify-center p-1">
                                      {url.includes('/video/') || url.endsWith('.mp4') ? (
                                        <video src={url} className="w-full h-full object-contain" />
                                      ) : (
                                        <img src={url} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SEO CONFIGS */}
        {activeTab === 'seo' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase">SECTION 4: SEARCH ENGINE OPTIMIZATION CONFIGURATIONS</h2>
            </div>

            <div className="space-y-6">
              {/* SEO Title */}
              <div>
                <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">SEO CUSTOM PAGE TITLE</label>
                <input
                  type="text"
                  value={project.seoTitle || ''}
                  onChange={e => updateField('seoTitle', e.target.value)}
                  placeholder="e.g. VANT Contemporary Fashion Label Brand Identity - Jake Amponsah"
                  className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-100 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                />
              </div>

              {/* SEO Description */}
              <div>
                <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">META DESCRIPTION</label>
                <textarea
                  value={project.seoDescription || ''}
                  onChange={e => updateField('seoDescription', e.target.value)}
                  placeholder="A refined case study showcasing..."
                  rows={3}
                  className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-200 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono resize-none leading-relaxed"
                />
              </div>

              {/* SEO Keywords */}
              <div>
                <label className="block text-[9px] font-mono tracking-widest text-zinc-500 mb-2 uppercase">SEO TARGET KEYWORDS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  value={project.seoKeywords || ''}
                  onChange={e => updateField('seoKeywords', e.target.value)}
                  placeholder="VANT, Fashion Branding, Minimalist Graphic Design..."
                  className="w-full px-4 py-3.5 bg-[#121214] border border-zinc-900 rounded-xl text-zinc-100 placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default ProjectEditor;