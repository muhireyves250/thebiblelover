import React, { useState } from 'react';
import { X, BookOpen, Save, Image as ImageIcon, History } from 'lucide-react';
import { devotionalAPI } from '../services/api';

interface AddDevotionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  devotionalToEdit?: any;
}

const AddDevotionalModal: React.FC<AddDevotionalModalProps> = ({ isOpen, onClose, onSave, devotionalToEdit }) => {
  const [formData, setFormData] = useState({
    title: devotionalToEdit?.title || '',
    verse: devotionalToEdit?.verse || '',
    content: devotionalToEdit?.content || '',
    author: devotionalToEdit?.author || 'Admin',
    image: devotionalToEdit?.image || 'https://images.pexels.com/photos/415571/pexels-photo-415571.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    date: devotionalToEdit?.date ? new Date(devotionalToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
      if (devotionalToEdit) {
        await devotionalAPI.update(devotionalToEdit.id, formData);
      } else {
        await devotionalAPI.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving devotional:', error);
      alert('Error saving manuscript. The sacred link is weak.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                <BookOpen className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-white">{devotionalToEdit ? 'Refine Manuscript' : 'Seed Devotional'}</h2>
                <p className="text-xs text-white/40 font-black uppercase tracking-widest">Daily Manna Management</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Title of the Word</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="The Theme of Today's Manna"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Sacred Date</label>
              <div className="relative">
                <History className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="Source of Wisdom"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Key Scripture (Verse)</label>
              <input
                type="text"
                name="verse"
                value={formData.verse}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="John 3:16"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">The Revelation (Content)</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={8}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                placeholder="Unfold the wisdom here..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Featured Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
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
              className="px-8 py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 uppercase tracking-widest text-[10px]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{devotionalToEdit ? 'Preserve Manuscript' : 'Seed Devotional'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDevotionalModal;
