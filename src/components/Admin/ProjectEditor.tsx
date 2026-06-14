import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../lib/api';
import { Project, Category, CaseStudySection, ProjectStatus } from '../../types';
import {
  X, Plus, ChevronLeft, Save, Star, Trash2, Eye, Layout, Type, Layers, Grid,
  ArrowUp, ArrowDown, GripVertical, FileText, Image as ImageIcon, Sparkles, Check,
  Upload, Film, ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Zod schema based on our strict specification mandates
const sectionSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'side-by-side', 'asymmetric-split']),
  content: z.object({
    textHeader: z.string().optional(),
    textBody: z.string().optional(),
    images: z.array(z.string()).optional(),
    layoutType: z.enum(['asymmetric-left', 'asymmetric-right', 'equal']).optional(),
  }),
  order: z.number()
});

const projectEditSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  category: z.string().min(1, 'Please select a category'),
  status: z.enum(['draft', 'published', 'archive']),
  isFeatured: z.boolean().default(false),
  client: z.string().optional(),
  year: z.string().optional(),
  role: z.string().optional(),
  description: z.string().min(1, 'A short dynamic summary is required'),
  longDescription: z.string().min(1, 'Full detailed overview is required'),
  previewImage: z.string().optional(),
  previewVideo: z.string().optional(),
  heroImage: z.string().optional(),
  heroVideo: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  sections: z.array(sectionSchema).default([])
});

type ProjectFormValues = z.infer<typeof projectEditSchema>;

interface ProjectEditorProps {
  projectId: number | null; // Null means create new
  onBack: () => void;
  onSaved: () => void;
}

// Draggable Sortable Gallery Item
function SortableGalleryItem({ url, index, onRemove }: { url: string; index: number; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const isVid = url.toLowerCase().includes('/video/') || url.toLowerCase().endsWith('.mp4');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden aspect-square flex flex-col justify-between group"
    >
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black">
        {isVid ? (
          <video src={url} muted className="h-full w-full object-cover" />
        ) : (
          <img src={url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        )}
        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-move"
          title="Drag and drop to sort thumbnail sequence"
        >
          <GripVertical size={20} className="text-white" />
        </div>
      </div>
      <div className="p-2 flex items-center justify-between text-[9px] font-mono text-zinc-500 bg-zinc-950">
        <span className="truncate max-w-20" title={url}>{index + 1}. {url.substring(url.lastIndexOf('/') + 1)}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-zinc-650 hover:text-red-500 cursor-pointer"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

interface FileUploaderFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
  type: 'image' | 'video';
  id: string;
}

function FileUploaderField({ label, value, onChange, placeholder, type, id }: FileUploaderFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const allowedExtensions = type === 'image'
      ? ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp']
      : ['.mp4', '.webm', '.ogg', '.mov'];

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    const isImage = allowedImageTypes.includes(fileType) || fileType.startsWith('image/');
    const isVideo = allowedVideoTypes.includes(fileType) || fileType.startsWith('video/');

    if (type === 'image' && !isImage) {
      return { isValid: false, error: 'Please select an image file (JPEG, PNG, WEBP, GIF, SVG, BMP).' };
    }
    if (type === 'video' && !isVideo) {
      return { isValid: false, error: 'Please select a video file (MP4, WEBM, OGG, MOV).' };
    }

    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `Invalid file extension. Please select a file ending with: ${allowedExtensions.join(', ')}`
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setProgress(0);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file selection.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setIsUploading(true);
      try {
        const displayName = file.name;
        const asset = await api.uploadMediaFile(file, displayName, (percent) => {
          setProgress(percent);
        });
        onChange(asset.url);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to upload file.');
      } finally {
        setIsUploading(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center sm:gap-2">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">{label}</label>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer focus:outline-none"
        >
          <Upload size={10} />
          Local {type === 'image' ? 'Image' : 'Video'}
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 pl-4 pr-10 text-xs font-mono transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-zinc-500">
          {type === 'image' ? <ImageIcon size={12} /> : <Film size={12} />}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept={type === 'image' ? 'image/*' : 'video/*'}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="text-[10px] text-red-500 font-mono flex items-center gap-1 animate-fade-in">
          <ShieldAlert size={10} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isUploading && (
        <div className="space-y-1 font-mono text-[9px] animate-fade-in bg-zinc-950 p-2 border border-zinc-900 rounded-lg">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Uploading local file...</span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectEditor({ projectId, onBack, onSaved }: ProjectEditorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'case-study' | 'seo'>('general');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [galleryError, setGalleryError] = useState('');
  
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectEditSchema) as any,
    defaultValues: {
      name: '',
      category: '',
      status: 'draft',
      isFeatured: false,
      client: '',
      year: '',
      role: '',
      description: '',
      longDescription: '',
      previewImage: '',
      previewVideo: '',
      heroImage: '',
      heroVideo: '',
      gallery: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      sections: []
    }
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control,
    name: "sections"
  });

  const galleryItems = watch('gallery') || [];
  const previewImage = watch('previewImage') || '';
  const previewVideo = watch('previewVideo') || '';
  const heroImage = watch('heroImage') || '';
  const heroVideo = watch('heroVideo') || '';

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);

        if (projectId !== null) {
          const originalProj = await api.getProject(projectId);
          // Set values into react hook form
          setValue('name', originalProj.name);
          setValue('category', originalProj.category);
          setValue('status', originalProj.status);
          setValue('isFeatured', originalProj.isFeatured || false);
          setValue('client', originalProj.client || '');
          setValue('year', originalProj.year || '');
          setValue('role', originalProj.role || '');
          setValue('description', originalProj.description || '');
          setValue('longDescription', originalProj.longDescription || '');
          setValue('previewImage', originalProj.previewImage || '');
          setValue('previewVideo', originalProj.previewVideo || '');
          setValue('heroImage', originalProj.heroImage || '');
          setValue('heroVideo', originalProj.heroVideo || '');
          setValue('gallery', originalProj.gallery || []);
          setValue('seoTitle', originalProj.seoTitle || '');
          setValue('seoDescription', originalProj.seoDescription || '');
          setValue('seoKeywords', originalProj.seoKeywords || '');
          setValue('sections', originalProj.sections || []);
        } else {
          // Pre-populate category
          if (cats.length > 0) setValue('category', cats[0].name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [projectId, setValue]);

  const handleFormSave = async (data: ProjectFormValues) => {
    try {
      if (projectId !== null) {
        await api.updateProject(projectId, data);
      } else {
        await api.createProject(data);
      }
      onSaved();
    } catch (err) {
      console.error(err);
    }
  };

  // Gallery actions
  const validateGalleryFile = (file: File): { isValid: boolean; error?: string } => {
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
        error: `Unsupported extension. Supported extensions: ${allowedExtensions.join(', ')}`
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

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setGalleryError('');
    setGalleryUploadProgress(0);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateGalleryFile(file);
      if (!validation.isValid) {
        setGalleryError(validation.error || 'Invalid file selection.');
        if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
        return;
      }

      setIsGalleryUploading(true);
      try {
        const displayName = file.name;
        const asset = await api.uploadMediaFile(file, displayName, (percent) => {
          setGalleryUploadProgress(percent);
        });
        if (galleryItems.includes(asset.url)) {
          setGalleryError('This file is already added to the gallery collection.');
        } else {
          setValue('gallery', [...galleryItems, asset.url]);
        }
      } catch (err: any) {
        setGalleryError(err.response?.data?.error || 'Failed to upload gallery asset.');
      } finally {
        setIsGalleryUploading(false);
        setGalleryUploadProgress(0);
        if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
      }
    }
  };

  const addGalleryImage = () => {
    setGalleryError('');
    if (!newGalleryUrl.trim()) return;
    if (!newGalleryUrl.startsWith('http://') && !newGalleryUrl.startsWith('https://')) {
      setGalleryError('Absolute URL required (starting with https:// or http://)');
      return;
    }
    if (galleryItems.includes(newGalleryUrl.trim())) {
      setGalleryError('URL is already registered in the gallery queue.');
      return;
    }

    setValue('gallery', [...galleryItems, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setValue('gallery', galleryItems.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragEndGallery = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = galleryItems.indexOf(active.id as string);
    const newIndex = galleryItems.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(galleryItems, oldIndex, newIndex);
      setValue('gallery', reordered);
    }
  };

  // Sections actions
  const addCaseStudySection = (type: 'text' | 'side-by-side' | 'asymmetric-split') => {
    const order = sectionFields.length + 1;
    const defaultSec: CaseStudySection = {
      id: 'sec_' + Date.now(),
      type,
      content: {
        textHeader: '',
        textBody: '',
        images: type === 'text' ? [] : ['', ''],
        layoutType: type === 'asymmetric-split' ? 'asymmetric-left' : 'equal'
      },
      order
    };
    appendSection(defaultSec);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Primary Details' },
    { id: 'media', label: 'Video & Image Ports' },
    { id: 'case-study', label: 'Dynamic Content Blocks' },
    { id: 'seo', label: 'SEO Configs' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in text-zinc-200">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Back to project lists catalog"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl uppercase tracking-tight font-display">
              {projectId !== null ? 'UPDATE SPECIFICATION' : 'NEW PROJECT COMPILER'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              {projectId !== null ? `Re-factoring active records: #${projectId}` : 'Formulatizing a new catalog item'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit(handleFormSave)}
          disabled={isSubmitting}
          className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <span className="inline-block animate-spin h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full" />
          ) : (
            <>
              <Save size={14} />
              Compile & Save
            </>
          )}
        </button>
      </div>

      {/* Tabs list navigation bar */}
      <div className="flex border-b border-zinc-900 overflow-x-auto gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'border-white text-white bg-zinc-900/45'
                : 'border-transparent text-zinc-500 hover:text-zinc-350 cursor-pointer'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleFormSave)} className="space-y-8 bg-zinc-950 p-6 sm:p-8 rounded-2xl border border-zinc-900">
        
        {/* ───── TAB 1: GENERAL INFO ───── */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Section 1: General Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-505 mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  {...register('name')}
                  placeholder="e.g. Spectral Exhibition Branding"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors"
                />
                {errors.name && <p className="text-red-500 font-mono text-[10px] mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Category *</label>
                <select
                  required
                  {...register('category')}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors text-white"
                >
                  <option value="">Choose category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name} className="bg-zinc-900">{c.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 font-mono text-[10px] mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Publish Status</label>
                <select
                  required
                  {...register('status')}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors text-white"
                >
                  <option value="draft" className="bg-zinc-900">Draft (Unlisted)</option>
                  <option value="published" className="bg-zinc-900">Published (Visible on site)</option>
                  <option value="archive" className="bg-zinc-900">Archived (Stored history)</option>
                </select>
              </div>

              <div className="flex items-center h-full pt-6 pl-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isFeatured')}
                    className="h-4 w-4 bg-zinc-900 border border-zinc-800 rounded focus:ring-0 checked:bg-white checked:border-white transition-colors"
                  />
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider">Features list inclusion</span>
                    <p className="text-[10px] text-zinc-550 font-mono mt-0.5">Toggle representation in homepage highlights</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-505 mb-2">Client name</label>
                <input
                  type="text"
                  {...register('client')}
                  placeholder="e.g. Ashesi University"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-505 mb-2">Year</label>
                  <input
                    type="text"
                    {...register('year')}
                    placeholder="e.g. 2026"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-505 mb-2">Role/Position</label>
                  <input
                    type="text"
                    {...register('role')}
                    placeholder="e.g. Interactive Stylist"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors"
                  />
                </div>
              </div>

            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Dynamic Intro Summary *</label>
              <textarea
                required
                {...register('description')}
                rows={2}
                placeholder="A high-contrast capitalize summary presented in the portfolio grids cards..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors uppercase font-mono"
              />
              {errors.description && <p className="text-red-500 font-mono text-[10px] mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Detailed Context & Overview *</label>
              <textarea
                required
                {...register('longDescription')}
                rows={5}
                placeholder="Elaborated project documentation details..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors"
              />
              {errors.longDescription && <p className="text-red-500 font-mono text-[10px] mt-1">{errors.longDescription.message}</p>}
            </div>

          </div>
        )}

        {/* ───── TAB 2: MEDIA PORTS ───── */}
        {activeTab === 'media' && (
          <div className="space-y-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Section 2: Asset Links Hooking</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FileUploaderField
                label="Fallback Image URL"
                id="previewImage"
                value={previewImage}
                onChange={(url) => setValue('previewImage', url)}
                placeholder="https://res.cloudinary.com/.../img.png"
                type="image"
              />

              <FileUploaderField
                label="Grid Video Loop URL (Optional)"
                id="previewVideo"
                value={previewVideo}
                onChange={(url) => setValue('previewVideo', url)}
                placeholder="https://res.cloudinary.com/.../video.mp4"
                type="video"
              />

              <FileUploaderField
                label="Hero Image URL (Landscape)"
                id="heroImage"
                value={heroImage}
                onChange={(url) => setValue('heroImage', url)}
                placeholder="https://res.cloudinary.com/.../large-banner.png"
                type="image"
              />

              <FileUploaderField
                label="Hero Video Reel (Optional)"
                id="heroVideo"
                value={heroVideo}
                onChange={(url) => setValue('heroVideo', url)}
                placeholder="https://res.cloudinary.com/.../hero-loop.mp4"
                type="video"
              />

            </div>

            {/* Gallery sorting block (DND KIT) */}
            <div className="border-t border-zinc-900 pt-8 space-y-4">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-white">Project Grid Gallery Collection</h4>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">Add, remove, and drag cards to configure display order.</p>
              </div>

              {/* Add item bar */}
              <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/degd6ahfu/..."
                  className="grow bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addGalleryImage}
                  className="px-4 py-2 bg-white text-black text-xs font-bold uppercase rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
                >
                  Add Item Link
                </button>
                <button
                  type="button"
                  disabled={isGalleryUploading}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase rounded-xl hover:bg-zinc-850 transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  <Upload size={12} />
                  Upload File
                </button>
              </div>

              <input
                type="file"
                ref={galleryFileInputRef}
                accept="image/*,video/*"
                onChange={handleGalleryFileChange}
                className="hidden"
              />

              {isGalleryUploading && (
                <div className="space-y-1.5 font-mono text-[10px] animate-fade-in bg-zinc-950 p-3 border border-zinc-900 rounded-xl max-w-xl">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Uploading asset to storage...
                    </span>
                    <span className="font-bold text-white">{galleryUploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                    <div
                      className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                      style={{ width: `${galleryUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {galleryError && <p className="text-red-500 font-mono text-[10px]">{galleryError}</p>}

              {/* Dnd Drag area */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndGallery}
              >
                <SortableContext
                  items={galleryItems}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 pt-4">
                    {galleryItems.map((url, idx) => (
                      <SortableGalleryItem
                        key={url}
                        url={url}
                        index={idx}
                        onRemove={() => removeGalleryImage(idx)}
                      />
                    ))}

                    {galleryItems.length === 0 && (
                      <div className="col-span-full py-10 border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-zinc-650 text-xs font-mono uppercase tracking-widest">
                        <span>The design gallery is currently empty.</span>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

          </div>
        )}

        {/* ───── TAB 3: DYNAMIC CASE STUDIES ───── */}
        {activeTab === 'case-study' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Section 3: Custom Page Assembly Builder</h3>
                <p className="text-[10px] text-zinc-550 font-mono mt-1">Mix typography nodes, side-by-side splits & asymmetrical spans</p>
              </div>

              {/* Block creation options */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addCaseStudySection('text')}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-mono tracking-wider hover:text-white rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Type size={11} />
                  + Text Node
                </button>
                <button
                  type="button"
                  onClick={() => addCaseStudySection('side-by-side')}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-mono tracking-wider hover:text-white rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Grid size={11} />
                  + Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => addCaseStudySection('asymmetric-split')}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-mono tracking-wider hover:text-white rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Layout size={11} />
                  + Odd Split
                </button>
              </div>
            </div>

            {/* List of active sections editors */}
            <div className="space-y-6 pt-4">
              {sectionFields.map((field, idx) => {
                const sType = watch(`sections.${idx}.type`);
                return (
                  <div key={field.id} className="p-6 bg-zinc-900/50 border border-zinc-900 rounded-2xl space-y-4 relative">
                    
                    {/* Upper title header in case block card */}
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <FileText size={12} />
                        Block #{idx + 1} ({sType.replace('-', ' ')})
                      </span>
                      
                      {/* Controls sorting/trash */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => idx > 0 && moveSection(idx, idx - 1)}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => idx < sectionFields.length - 1 && moveSection(idx, idx + 1)}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(idx)}
                          className="p-1.5 hover:bg-red-950/40 text-zinc-500 hover:text-red-500 rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Inputs based on section type */}
                    {sType === 'text' ? (
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Header Accent</label>
                          <input
                            type="text"
                            {...register(`sections.${idx}.content.textHeader`)}
                            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-zinc-800 uppercase"
                            placeholder="e.g. VISUAL DIALOGUES"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Markdown Paragraph Block</label>
                          <textarea
                            {...register(`sections.${idx}.content.textBody`)}
                            rows={4}
                            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-zinc-800"
                            placeholder="Enter the case study details here..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Left/First Media URL</label>
                            <input
                              type="text"
                              {...register(`sections.${idx}.content.images.0` as any)}
                              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-1.5 px-3 text-xs font-mono focus:outline-none"
                              placeholder="https://res.cloudinary.com/.../img1.jpg"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Right/Second Media URL</label>
                            <input
                              type="text"
                              {...register(`sections.${idx}.content.images.1` as any)}
                              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-1.5 px-3 text-xs font-mono focus:outline-none"
                              placeholder="https://res.cloudinary.com/.../img2.jpg"
                            />
                          </div>
                        </div>

                        {sType === 'asymmetric-split' && (
                          <div>
                            <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Span Ratio Allocation</label>
                            <select
                              {...register(`sections.${idx}.content.layoutType`)}
                              className="bg-zinc-950 border border-zinc-900 rounded-lg py-1 px-2 text-[10px] text-zinc-400 font-mono outline-none"
                            >
                              <option value="asymmetric-left">2/3 (Left Media Area) - 1/3 (Right Media)</option>
                              <option value="asymmetric-right">1/3 (Left Media) - 2/3 (Right Media Area)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}

              {sectionFields.length === 0 && (
                <div className="py-16 bg-zinc-950/40 border-2 border-dashed border-zinc-900 rounded-3xl text-center flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-650">
                  <span>No custom modular layouts are defined currently.</span>
                  <span className="text-[10px] mt-2 block italic text-zinc-700">Add blocks from the options above.</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ───── TAB 4: SEO METADATA ───── */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Section 4: Search Engine Optimization Configurations</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">SEO Custom Page Title</label>
                <input
                  type="text"
                  {...register('seoTitle')}
                  placeholder="Jake Amponsah — Case Study Catalog Layout"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Meta Description</label>
                <textarea
                  {...register('seoDescription')}
                  rows={3}
                  placeholder="Search indices description blurb. Recommended length: under 160 characters..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">SEO Target Keywords (comma-separated)</label>
                <input
                  type="text"
                  {...register('seoKeywords')}
                  placeholder="Branding, Art Direction, Motion Renders, West Africa"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-white rounded-xl py-2.5 px-4 text-xs font-mono transition-colors"
                />
              </div>
            </div>

          </div>
        )}

      </form>
    </div>
  );
}
