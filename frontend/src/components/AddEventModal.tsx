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
      alert('Error saving event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">{eventToEdit ? 'Edit Event' : 'New Event'}</h2>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Community event management</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Event Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-md px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-600 transition-colors"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-md pl-10 pr-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Time</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-md pl-10 pr-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-600 transition-colors"
                  placeholder="e.g. 10:00 AM"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-md pl-10 pr-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-600 transition-colors"
                  placeholder="Physical or virtual address"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-md px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-600 transition-colors resize-none"
                placeholder="What will happen at this event?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Cover Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/10 rounded-md pl-10 pr-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-600 transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 dark:border-white/10 rounded-md text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors uppercase tracking-widest text-[10px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-700 text-white rounded-md font-bold hover:bg-amber-800 transition-colors flex items-center gap-2 disabled:opacity-50 uppercase tracking-widest text-[10px]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{eventToEdit ? 'Save Changes' : 'Create Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
