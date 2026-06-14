import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Category } from '../../types';
import { Trash2, Edit3, Save, X, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';
import ConfirmModal from './ConfirmModal';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<{ id: string; name: string } | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setError('');
    setSuccess('');

    try {
      const existing = categories.find(c => c.name.toLowerCase() === newCatName.toLowerCase());
      if (existing) {
        setError('Category already exists.');
        return;
      }

      await api.createCategory(newCatName.trim());
      setNewCatName('');
      setSuccess('Category created successfully!');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create category.');
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const handleUpdate = async (id: string) => {
    if (!editingCatName.trim()) return;
    setError('');
    setSuccess('');

    try {
      await api.updateCategory(id, editingCatName.trim());
      setEditingCatId(null);
      setSuccess('Category updated!');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update category.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDeleteCat({ id, name });
  };

  const executeDelete = async (id: string) => {
    setError('');
    setSuccess('');

    try {
      await api.deleteCategory(id);
      setSuccess('Category deleted successfully.');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete category.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in text-zinc-200">
      
      <div>
        <h2 className="text-2xl uppercase tracking-tight font-display">CATEGORY MANAGEMENT</h2>
        <p className="text-xs text-zinc-500 mt-1 font-mono">Create, update, and manage project classifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Creation Panel */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Add Category</h3>
          
          {error && <div className="p-3 bg-red-950/30 border border-red-900 text-red-500 text-xs font-mono rounded-xl">{error}</div>}
          {success && <div className="p-3 bg-emerald-950/30 border border-emerald-900 text-emerald-500 text-xs font-mono rounded-xl">{success}</div>}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Category Name</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. 3D Renders"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-white"
            >
              <Plus size={14} />
              Save Category
            </button>
          </form>
        </div>

        {/* Listings Panel */}
        <div className="md:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Classifications List</h3>
          
          <div className="divide-y divide-zinc-900">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="py-4 flex items-center justify-between gap-4">
                {editingCatId === cat.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      required
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-white"
                    />
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      className="p-2 bg-white text-black rounded-lg hover:bg-zinc-200"
                      aria-label="Save changes"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg"
                      aria-label="Cancel editing"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-sm font-medium uppercase font-sans text-white">{cat.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-500 mt-1">slug: {cat.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        aria-label={`Edit category ${cat.name}`}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 hover:bg-red-950/30 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Delete category ${cat.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {categories.length === 0 && (
              <p className="text-sm text-zinc-500 font-mono py-8 text-center uppercase tracking-widest">
                No custom classes configured
              </p>
            )}
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={confirmDeleteCat !== null}
        onClose={() => setConfirmDeleteCat(null)}
        onConfirm={() => confirmDeleteCat && executeDelete(confirmDeleteCat.id)}
        title="Delete Category"
        message={`Are you sure you want to delete the "${confirmDeleteCat?.name}" category? Existing projects under this category may need re-assignment.`}
        confirmText="Remove Category"
        isDanger={true}
      />
    </div>
  );
}
