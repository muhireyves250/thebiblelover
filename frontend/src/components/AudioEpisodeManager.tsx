import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Heart, Mic } from 'lucide-react';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';
import AddAudioEpisodeModal from './AddAudioEpisodeModal';
import EditAudioEpisodeModal from './EditAudioEpisodeModal';
import AudioCommentsManager from './AudioCommentsManager';

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
      {/* Header */}
      <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white">Morning/Evening Episodes</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage daily devotional audio episodes</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-bold">New Episode</span>
          </button>
        </div>
      </div>

      {/* Episodes List */}
      <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
          </div>
        ) : loadError ? (
          <p className="text-sm text-red-600 dark:text-red-400 text-center py-10">Failed to load episodes. Please try again later.</p>
        ) : episodes.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Mic className="h-6 w-6 text-amber-700" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Episodes Yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Add your first devotional episode to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Episode</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Slot</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden md:table-cell">Date</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden lg:table-cell">Likes</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden lg:table-cell">Comments</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {episodes.map((episode) => (
                  <tr key={episode.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {episode.coverImage ? (
                          <img
                            src={episode.coverImage}
                            alt=""
                            className="w-9 h-9 rounded-md object-cover border border-gray-200 dark:border-white/10 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                            <Mic className="w-4 h-4 text-amber-700" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{episode.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {episode.slot === 'MORNING' ? 'Morning' : 'Evening'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 hidden md:table-cell">
                      {new Date(episode.episodeDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200">
                        <Heart className="w-3 h-3 text-gray-400 dark:text-gray-500" /> {episode.likes}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200">
                        <MessageSquare className="w-3 h-3 text-gray-400 dark:text-gray-500" /> {episode.commentsCount ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${episode.isPublished ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10'}`}>
                        {episode.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingEpisode(episode)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Edit episode">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(episode.id)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete episode">
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
      </div>

      <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-5">
        <AudioCommentsManager />
      </div>

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
          <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg max-w-sm w-full p-6">
            <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">Delete this episode?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-semibold">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioEpisodeManager;
