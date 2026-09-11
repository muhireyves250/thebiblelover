import React, { useState } from 'react';
import { X } from 'lucide-react';
import ImageUpload from './ImageUpload';
import AudioUpload from './AudioUpload';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';

interface EditAudioEpisodeModalProps {
  isOpen: boolean;
  episode: AudioEpisode;
  onClose: () => void;
  onSave: (episode: AudioEpisode) => void;
}

const EditAudioEpisodeModal: React.FC<EditAudioEpisodeModalProps> = ({ isOpen, episode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: episode.title,
    description: episode.description,
    audioUrl: episode.audioUrl,
    coverImage: episode.coverImage,
    slot: episode.slot,
    episodeDate: episode.episodeDate.slice(0, 10),
    isPublished: episode.isPublished
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (!formData.audioUrl) {
      setError('Please upload or record an audio file.');
      return;
    }
    if (!formData.coverImage) {
      setError('Please upload a cover photo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await audioEpisodesAPI.updateEpisode(episode.id, {
        ...formData,
        episodeDate: new Date(formData.episodeDate).toISOString()
      });
      if (response.success && response.data?.episode) {
        onSave(response.data.episode);
        onClose();
      } else {
        setError(response.message || 'Failed to update episode');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update episode');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Episode</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <ImageUpload
            value={formData.coverImage}
            onChange={(url) => setFormData({ ...formData, coverImage: url })}
          />

          <AudioUpload
            value={formData.audioUrl}
            onChange={(url) => setFormData({ ...formData, audioUrl: url })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slot</label>
              <select
                value={formData.slot}
                onChange={(e) => setFormData({ ...formData, slot: e.target.value as 'MORNING' | 'EVENING' })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="MORNING">Morning</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.episodeDate}
                onChange={(e) => setFormData({ ...formData, episodeDate: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700">Published</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPublished ? 'bg-amber-700' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-700 border border-gray-300">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-amber-700 text-white font-bold hover:bg-amber-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAudioEpisodeModal;
