import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Heart } from 'lucide-react';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';
import AddAudioEpisodeModal from './AddAudioEpisodeModal';
import EditAudioEpisodeModal from './EditAudioEpisodeModal';

const AudioEpisodeManager: React.FC = () => {
  const [episodes, setEpisodes] = useState<AudioEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<AudioEpisode | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadEpisodes = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await audioEpisodesAPI.getAllEpisodes();
      if (response.success && response.data) {
        setEpisodes(response.data.episodes);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpisodes();
  }, []);

  const handleDelete = async (id: string) => {
    const response = await audioEpisodesAPI.deleteEpisode(id);
    if (response.success) {
      setEpisodes(prev => prev.filter(e => e.id !== id));
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Morning/Evening Episodes</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-bold hover:bg-amber-800"
        >
          <Plus className="w-4 h-4" /> New Episode
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading episodes...</p>
      ) : loadError ? (
        <p className="text-sm text-red-600">Failed to load episodes. Please try again later.</p>
      ) : episodes.length === 0 ? (
        <p className="text-sm text-gray-500">No episodes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                <th className="py-2">Episode</th>
                <th className="py-2">Slot</th>
                <th className="py-2">Date</th>
                <th className="py-2">Likes</th>
                <th className="py-2">Comments</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {episodes.map((episode) => (
                <tr key={episode.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 flex items-center gap-2">
                    <img src={episode.coverImage} alt={episode.title} className="w-10 h-10 rounded object-cover" />
                    <span className="font-medium text-gray-900">{episode.title}</span>
                  </td>
                  <td className="py-2">{episode.slot === 'MORNING' ? 'Morning' : 'Evening'}</td>
                  <td className="py-2">{new Date(episode.episodeDate).toLocaleDateString()}</td>
                  <td className="py-2">
                    <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> {episode.likes}</span>
                  </td>
                  <td className="py-2">
                    <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3 text-purple-500" /> {episode.commentsCount ?? 0}</span>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${episode.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {episode.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-1">
                      <button onClick={() => setEditingEpisode(episode)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(episode.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddAudioEpisodeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={(episode) => setEpisodes(prev => [episode, ...prev])}
        />
      )}

      {editingEpisode && (
        <EditAudioEpisodeModal
          isOpen={!!editingEpisode}
          episode={editingEpisode}
          onClose={() => setEditingEpisode(null)}
          onSave={(episode) => setEpisodes(prev => prev.map(e => e.id === episode.id ? episode : e))}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <p className="text-gray-900 font-bold mb-2">Delete this episode?</p>
            <p className="text-sm text-gray-500 mb-4">This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioEpisodeManager;
