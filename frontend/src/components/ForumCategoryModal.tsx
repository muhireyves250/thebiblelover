import React, { useState } from 'react';
import { X, Layers, Save, Hash, AlignLeft } from 'lucide-react';
import { forumAPI } from '../services/api';

interface ForumCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  categoryToEdit?: any;
}

const ForumCategoryModal: React.FC<ForumCategoryModalProps> = ({ isOpen, onClose, onSave, categoryToEdit }) => {
  const [formData, setFormData] = useState({
    name: categoryToEdit?.name || '',
    description: categoryToEdit?.description || '',
    icon: categoryToEdit?.icon || 'MessageSquare',
    order: categoryToEdit?.order || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (categoryToEdit) {
        await forumAPI.adminUpdateCategory(categoryToEdit.id, formData);
      } else {
        await forumAPI.adminCreateCategory(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving sphere. The foundation is unstable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                <Layers className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-white">{categoryToEdit ? 'Reshape Sphere' : 'Create Sphere'}</h2>
                <p className="text-xs text-white/40 font-black uppercase tracking-widest">Forum Category Management</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Category Name</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="e.g. Daily Walk, Youth Haven"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 h-4 w-4 text-white/20" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  placeholder="Define the purpose of this sphere..."
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-white/10 rounded-2xl text-white/60 font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 uppercase tracking-widest text-[10px]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{categoryToEdit ? 'Preserve Sphere' : 'Manifest Sphere'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForumCategoryModal;
