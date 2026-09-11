import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Check } from 'lucide-react';
import { audioEpisodesAPI } from '../services/api';
import type { AudioComment } from '../services/api.d';

const AudioCommentsManager: React.FC = () => {
  const [comments, setComments] = useState<AudioComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  const loadComments = async (status: 'pending' | 'approved' | 'all') => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await audioEpisodesAPI.getAdminComments(
        status === 'all' ? {} : { status }
      );
      if (response.success && response.data) {
        setComments(response.data.comments);
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
    loadComments(filter);
  }, [filter]);

  const handleApprove = async (id: string) => {
    const response = await audioEpisodesAPI.approveComment(id);
    if (response.success) {
      if (filter === 'pending') {
        setComments(prev => prev.filter(c => c.id !== id));
      } else {
        setComments(prev => prev.map(c => c.id === id ? { ...c, isApproved: true } : c));
      }
    }
  };

  const handleDelete = async (id: string) => {
    const response = await audioEpisodesAPI.deleteCommentAdmin(id);
    if (response.success) {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-500" /> Episode Comments
        </h2>
        <div className="flex gap-2">
          {(['pending', 'approved', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border ${
                filter === tab ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading comments...</p>
      ) : loadError ? (
        <p className="text-sm text-red-600">Failed to load comments. Please try again later.</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">
          {filter === 'pending' ? 'No comments awaiting approval.' : 'No comments found.'}
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">{comment.authorName}</span>
                    <span className="text-xs text-gray-400">{comment.authorEmail}</span>
                    {comment.episode && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">{comment.episode.title}</span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        comment.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {comment.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!comment.isApproved && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Approve comment"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioCommentsManager;
