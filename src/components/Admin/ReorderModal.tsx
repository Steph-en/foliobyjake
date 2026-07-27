import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { 
  X, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, 
  GripVertical, Film, Layers, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSaveOrder: (reorderedProjects: Project[]) => Promise<void>;
}

export default function ReorderModal({ isOpen, onClose, projects, onSaveOrder }: ReorderModalProps) {
  const [items, setItems] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setItems([...projects]);
      setSavedSuccess(false);
    }
  }, [isOpen, projects]);

  if (!isOpen) return null;

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
  };

  const handleMoveToTop = (index: number) => {
    moveItem(index, 0);
  };

  const handleMoveToBottom = (index: number) => {
    moveItem(index, items.length - 1);
  };

  const handleMoveUp = (index: number) => {
    moveItem(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    moveItem(index, index + 1);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndexStr = e.dataTransfer.getData('text/plain');
    if (dragIndexStr !== undefined && dragIndexStr !== '') {
      const dragIdx = parseInt(dragIndexStr, 10);
      if (!isNaN(dragIdx) && dragIdx !== dropIndex) {
        moveItem(dragIdx, dropIndex);
      }
    }
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveOrder(items);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error('Failed to save project order:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/50">
            <div>
              <h3 className="text-lg uppercase tracking-tight font-display font-bold text-white flex items-center gap-2">
                REARRANGE PORTFOLIO DISPLAY ORDER
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Drag rows or use arrow controls to reorder projects as they appear on the portfolio page.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-zinc-900/40">
            {items.map((item, index) => {
              const previewVid = item.previewVideo || item.heroVideo;
              const isFirst = index === 0;
              const isLast = index === items.length - 1;
              const isDragging = draggedIndex === index;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`pt-2 first:pt-0 flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900 hover:border-zinc-700 transition-all ${
                    isDragging ? 'opacity-40 border-dashed border-white' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Drag Handle & Position Badge */}
                    <div className="flex items-center gap-2 text-zinc-500 shrink-0">
                      <span className="cursor-grab active:cursor-grabbing p-1 hover:text-zinc-300">
                        <GripVertical size={16} />
                      </span>
                      <span className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-mono text-xs font-bold text-white shrink-0">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="h-10 w-10 bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-800 flex items-center justify-center">
                      {previewVid ? (
                        <Film size={14} className="text-zinc-500" />
                      ) : item.previewImage || item.heroImage ? (
                        <img
                          src={item.previewImage || item.heroImage}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Layers size={14} className="text-zinc-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 truncate">
                      <h4 className="text-xs font-medium uppercase text-white truncate font-sans">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {item.category}
                        </span>
                        <span className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                          item.status === 'published' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900' :
                          item.status === 'draft' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' :
                          'bg-red-950/30 text-red-400 border-red-900'
                        }`}>
                          {item.status}
                        </span>
                        {item.isFeatured && (
                          <span className="text-[8px] font-mono uppercase px-1.5 py-0.2 rounded border bg-amber-950/30 text-amber-400 border-amber-900 font-bold">
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleMoveToTop(index)}
                      disabled={isFirst}
                      title="Move to Top"
                      className="p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                    >
                      <ChevronsUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst}
                      title="Move Up"
                      className="p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast}
                      title="Move Down"
                      className="p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveToBottom(index)}
                      disabled={isLast}
                      title="Move to Bottom"
                      className="p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                    >
                      <ChevronsDown size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-900 bg-zinc-900/40 flex items-center justify-between">
            <p className="text-[11px] font-mono text-zinc-500">
              {items.length} total projects in display catalog
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full" />
                    <span>Saving...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <Check size={14} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save New Order</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
