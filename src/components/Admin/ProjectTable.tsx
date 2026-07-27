import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Project, ProjectStatus, Category } from '../../types';
import {
  Search, Eye, Edit, Trash2, Copy, ExternalLink, Filter,
  Layers, ChevronDown, CheckSquare, Square, AlertCircle, RefreshCw, Film,
  ArrowUp, ArrowDown, ArrowUpDown, ListOrdered, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from './ConfirmModal';
import ReorderModal from './ReorderModal';

interface ProjectTableProps {
  onEditProject: (id: number) => void;
  onAddNewProject: () => void;
}

export default function ProjectTable({ onEditProject, onAddNewProject }: ProjectTableProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filters & Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'custom' | 'name' | 'views' | 'date'>('custom');

  // Reorder Modal State
  const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Confirmation Modals State
  const [confirmSingleDelete, setConfirmSingleDelete] = useState<{ id: number; name: string } | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const projs = await api.getProjects(true);
      const cats = await api.getCategories();
      setProjects(projs);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDuplicate = async (id: number) => {
    try {
      await api.duplicateProject(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: number, name: string) => {
    setConfirmSingleDelete({ id, name });
  };

  const executeDelete = async (id: number) => {
    try {
      await api.deleteProject(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Reordering Handler
  const handleSaveReorder = async (reorderedProjects: Project[]) => {
    setProjects(reorderedProjects);
    await api.reorderProjects(reorderedProjects.map(p => p.id));
  };

  const handleInlineMove = async (id: number, direction: 'up' | 'down') => {
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const updated = [...projects];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    setProjects(updated);
    try {
      await api.reorderProjects(updated.map(p => p.id));
    } catch (err) {
      console.error('Failed to inline reorder:', err);
    }
  };

  // Selection toggles
  const handleToggleSelectAll = (filteredProjs: Project[]) => {
    if (selectedIds.length === filteredProjs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjs.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkStatusChange = async (status: ProjectStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => api.updateProject(id, { status }))
      );
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmBulkDelete(true);
  };

  const executeBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map((id) => api.deleteProject(id)));
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Process filters
  const processedProjects = projects
    .filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.client && item.client.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'custom') return 0; // Maintain original array order
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      // Date fallback
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Newest first
    });

  if (loading) {
    return (
      <div className="flex justify-center p-20 animate-fade-in">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-zinc-200 font-sans">
      
      {/* Title & Add/Reorder Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-2xl uppercase tracking-tight font-display">PROJECT LEOPARD CATALOG</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">Create, duplicate, rearrange, bulk compile, and edit project directories</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsReorderModalOpen(true)}
            className="px-5 py-3 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-2 rounded-xl cursor-pointer"
          >
            <ListOrdered size={15} />
            <span>Rearrange Order</span>
          </button>
          <button
            onClick={onAddNewProject}
            className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          >
            Add New Project
          </button>
        </div>
      </div>

      {/* Grid Filter Actions bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-900 rounded-2xl">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or clients..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Layers size={12} className="text-zinc-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 outline-none pr-2"
            >
              <option value="all" className="bg-zinc-900">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name} className="bg-zinc-900">{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Filter size={12} className="text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 outline-none pr-2"
            >
              <option value="all" className="bg-zinc-900">All Statuses</option>
              <option value="published" className="bg-zinc-900">Published</option>
              <option value="draft" className="bg-zinc-900">Draft</option>
              <option value="archive" className="bg-zinc-900">Archive</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <ArrowUpDown size={12} className="text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 outline-none pr-2 font-mono"
            >
              <option value="custom" className="bg-zinc-900">Custom Portfolio Order</option>
              <option value="date" className="bg-zinc-900">Date Added</option>
              <option value="name" className="bg-zinc-900">Alpha Name</option>
              <option value="views" className="bg-zinc-900">Views Traffic</option>
            </select>
          </div>

        </div>
      </div>

      {/* Bulk actions banner if items are selected */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-zinc-200 pr-6"
          >
            <div className="flex items-center gap-2">
              <CheckSquare size={14} className="text-white" />
              <span>{selectedIds.length} project(s) selected for compilation.</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('published')}
                className="px-3 py-1.5 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
              >
                Publish All
              </button>
              <button
                onClick={() => handleBulkStatusChange('draft')}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors"
              >
                Draft All
              </button>
              <button
                onClick={() => handleBulkStatusChange('archive')}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition-colors"
              >
                Archive All
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-950/40 border border-red-900/60 text-red-400 rounded hover:bg-red-950/80 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main projects listings listing */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-175">
          <thead>
            <tr className="border-b border-zinc-900 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
              <th className="py-4 pl-6 pr-4 w-12 align-middle">
                <button
                  onClick={() => handleToggleSelectAll(processedProjects)}
                  className="text-zinc-500 hover:text-white"
                  aria-label="Toggle select all items"
                >
                  {selectedIds.length === processedProjects.length && processedProjects.length > 0 ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              {sortBy === 'custom' && <th className="py-4 px-2 w-16">Pos</th>}
              <th className="py-4 px-4">Project Preview</th>
              <th className="py-4 px-4">Specification Attributes</th>
              <th className="py-4 px-4">Status Label</th>
              <th className="py-4 px-4">Views Traffic</th>
              <th className="py-4 pr-6 text-right">Row Interactions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-xs">
            {processedProjects.map((item) => {
              const isSel = selectedIds.includes(item.id);
              const previewVid = item.previewVideo || item.heroVideo;
              const globalIdx = projects.findIndex(p => p.id === item.id);
              const isFirst = globalIdx === 0;
              const isLast = globalIdx === projects.length - 1;

              return (
                <tr key={item.id} className={`hover:bg-zinc-900/35 transition-colors ${isSel ? 'bg-zinc-900/20' : ''}`}>
                  
                  {/* Row Checkbox cell */}
                  <td className="py-6 pl-6 pr-4 align-middle">
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      className="text-zinc-500 hover:text-white cursor-pointer"
                      aria-label={`Select project ${item.name}`}
                    >
                      {isSel ? <CheckSquare size={16} className="text-white" /> : <Square size={16} />}
                    </button>
                  </td>

                  {/* Position Badge in Custom Mode */}
                  {sortBy === 'custom' && (
                    <td className="py-6 px-2 align-middle font-mono text-[11px] text-zinc-500">
                      <span className="inline-block px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold">
                        #{globalIdx + 1}
                      </span>
                    </td>
                  )}

                  {/* Thumbnail and Title cell */}
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-4">
                      
                      {/* Grid preview cell */}
                      <div className="h-12 w-10 bg-zinc-900 rounded overflow-hidden shrink-0 flex items-center justify-center border border-zinc-800/80">
                        {previewVid ? (
                          <Film size={12} className="text-zinc-600" />
                        ) : item.previewImage || item.heroImage ? (
                          <img
                            src={item.previewImage || item.heroImage}
                            alt=""
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Layers size={12} className="text-zinc-600" />
                        )}
                      </div>

                      {/* Labels info */}
                      <div>
                        <h4 className="text-sm font-medium uppercase font-sans text-white">{item.name}</h4>
                        <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">{item.category}</p>
                      </div>

                    </div>
                  </td>

                  {/* Attributes metadata column */}
                  <td className="py-6 px-4 font-mono text-zinc-400">
                    <div className="space-y-1 text-[10px]">
                      {item.client && <p><span className="text-zinc-600">CLIENT:</span> {item.client}</p>}
                      {item.year && <p><span className="text-zinc-600">YEAR:</span> {item.year}</p>}
                      {item.role && <p className="truncate max-w-37.5"><span className="text-zinc-600">ROLE:</span> {item.role}</p>}
                    </div>
                  </td>

                  {/* Status pills wrapper */}
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-widest border font-semibold ${
                      item.status === 'published' ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400' :
                      item.status === 'draft' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' :
                      'bg-red-950/20 border-red-900 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const nextFeatured = !item.isFeatured;
                        setProjects(prev => prev.map(p => p.id === item.id ? { ...p, isFeatured: nextFeatured } : p));
                        try {
                          await api.updateProject(item.id, { isFeatured: nextFeatured });
                        } catch (err) {
                          console.error('Failed to toggle featured state:', err);
                        }
                      }}
                      title={item.isFeatured ? 'Click to remove from Featured' : 'Click to feature project'}
                      className={`ml-2 inline-flex items-center gap-1 border text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                        item.isFeatured 
                          ? 'bg-amber-950/30 border-amber-800 text-amber-400 hover:bg-amber-900/50' 
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <Star size={10} className={item.isFeatured ? 'fill-amber-400 text-amber-400' : ''} />
                      <span>{item.isFeatured ? 'Featured' : 'Feature'}</span>
                    </button>
                  </td>

                  {/* Views count display */}
                  <td className="py-6 px-4 align-middle font-mono">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Eye size={13} className="text-zinc-600" />
                      <span>{item.views || 0}</span>
                    </div>
                  </td>

                  {/* Operational interactions */}
                  <td className="py-6 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Inline Move Up / Move Down buttons when in Custom Order mode */}
                      {sortBy === 'custom' && (
                        <div className="flex items-center gap-0.5 mr-2 pr-2 border-r border-zinc-850">
                          <button
                            onClick={() => handleInlineMove(item.id, 'up')}
                            disabled={isFirst}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors cursor-pointer"
                            title="Move project up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            onClick={() => handleInlineMove(item.id, 'down')}
                            disabled={isLast}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors cursor-pointer"
                            title="Move project down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => onEditProject(item.id)}
                        className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Edit project structure"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(item.id)}
                        className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Duplicate project"
                      >
                        <Copy size={14} />
                      </button>
                      <a
                        href={`/work/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors inline-block"
                        title="Inspect public detail page"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 hover:bg-red-950/30 text-zinc-500 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}

            {processedProjects.length === 0 && (
              <tr>
                <td colSpan={sortBy === 'custom' ? 7 : 6} className="py-16 text-center font-mono text-zinc-500 uppercase tracking-widest text-[11px]">
                  No compiled works match the filter parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reorder Modal */}
      <ReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        projects={projects}
        onSaveOrder={handleSaveReorder}
      />

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmSingleDelete !== null}
        onClose={() => setConfirmSingleDelete(null)}
        onConfirm={() => confirmSingleDelete && executeDelete(confirmSingleDelete.id)}
        title="Delete Project"
        message={`Are you sure you want to delete the project "${confirmSingleDelete?.name}" permanently? This cannot be undone.`}
        confirmText="Delete permanently"
        isDanger={true}
      />

      <ConfirmModal
        isOpen={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={executeBulkDelete}
        title="Bulk Delete Projects"
        message={`Are you sure you want to permanently delete the ${selectedIds.length} selected projects? This cannot be undone.`}
        confirmText="Delete selected"
        isDanger={true}
      />
    </div>
  );
}
