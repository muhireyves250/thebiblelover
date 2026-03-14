import React, { useState } from 'react';
import { X, Calendar, MapPin, Clock, Save, Image as ImageIcon } from 'lucide-react';
import { eventAPI } from '../services/api';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  eventToEdit?: any;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSave, eventToEdit }) => {
  const [formData, setFormData] = useState({
    title: eventToEdit?.title || '',
    description: eventToEdit?.description || '',
    date: eventToEdit?.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : '',
    time: eventToEdit?.time || '',
    location: eventToEdit?.location || '',
    image: eventToEdit?.image || 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: eventToEdit?.category || 'COMMUNITY'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (eventToEdit) {
        await eventAPI.update(eventToEdit.id, formData);
      } else {
        await eventAPI.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please check the sanctuary connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-white">{eventToEdit ? 'Edit Gathering' : 'Orchestrate Gathering'}</h2>
                <p className="text-xs text-white/40 font-black uppercase tracking-widest">Community Event Management</p>
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Event Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="e.g. 10:00 AM"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="Physical or Virtual Address"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                placeholder="What will happen at this gathering?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Cover Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="https://..."
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
              className="px-8 py-3 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 uppercase tracking-widest text-[10px]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{eventToEdit ? 'Preserve Changes' : 'Broadcast Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
