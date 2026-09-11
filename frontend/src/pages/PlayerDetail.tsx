import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode, AudioComment } from '../services/api.d';
import SEO from '../components/SEO';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<AudioEpisode | null>(null);
  const [comments, setComments] = useState<AudioComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [commentError, setCommentError] = useState('');

  const refetchComments = async () => {
    if (!id) return;
    const response = await audioEpisodesAPI.getComments(id);
    if (response.success && response.data) setComments(response.data.comments);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(false);
    audioEpisodesAPI.getEpisode(id).then((response) => {
      if (response.success && response.data) {
        setEpisode(response.data.episode);
        setLikeCount(response.data.episode.likes);
        setIsLiked(localStorage.getItem(`liked:episode:${id}`) === '1');
      } else {
        setLoadError(true);
      }
      setLoading(false);
    }).catch(() => {
      setLoadError(true);
      setLoading(false);
    });
    refetchComments().catch(() => {});
  }, [id]);

  const handleLike = async () => {
    if (!id || isLiking) return;
    setIsLiking(true);
    try {
      if (isLiked) {
        const res = await audioEpisodesAPI.unlikeEpisode(id);
        if (res.success && res.data) setLikeCount(res.data.likes);
        setIsLiked(false);
        localStorage.removeItem(`liked:episode:${id}`);
      } else {
        const res = await audioEpisodesAPI.likeEpisode(id);
        if (res.success && res.data) setLikeCount(res.data.likes);
        setIsLiked(true);
        localStorage.setItem(`liked:episode:${id}`, '1');
      }
    } finally {
      setIsLiking(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingComment(true);
    setCommentError('');
    try {
      const response = await audioEpisodesAPI.addComment(id, { authorName, authorEmail, content: commentContent });
      if (response.success) {
        setAuthorName('');
        setAuthorEmail('');
        setCommentContent('');
        setCommentSubmitted(true);
      } else {
        setCommentError(response.message || 'Failed to submit comment. Please try again.');
      }
    } catch {
      setCommentError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>;
  }

  if (loadError) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Failed to load episode. Please try again later.</div>;
  }

  if (!episode) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Episode not found.</div>;
  }

  return (
    <>
      <SEO title={episode.title} description={episode.description} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{episode.slot === 'MORNING' ? 'Morning Episode' : 'Evening Episode'}</span>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mt-2 mb-2">{episode.title}</h1>
        <p className="text-sm text-gray-400 mb-6">{formatDate(episode.episodeDate)}</p>

        <img src={episode.coverImage} alt={episode.title} className="w-full h-64 object-cover rounded-lg mb-6" />

        <audio controls src={episode.audioUrl} className="w-full mb-6" />

        <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">{episode.description}</p>

        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-colors ${
            isLiked ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          ♥ {likeCount} {isLiked ? 'Liked' : 'Like'}
        </button>

        {/* Comments */}
        <section className="mt-12">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">Comments ({comments.length})</h2>
          <div className="space-y-4 mb-10">
            {comments.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-semibold">
                    {c.authorName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{c.authorName}</div>
                      <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">No comments yet. Be the first to comment!</div>
            )}
          </div>

          {commentSubmitted ? (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 text-sm text-amber-800">
              Thanks! Your comment has been submitted and will appear once approved.
            </div>
          ) : (
            <form onSubmit={submitComment} className="space-y-5 bg-gray-50 border border-gray-200 p-5 rounded-lg">
              {commentError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                  {commentError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="commentName" className="block text-sm text-gray-700 mb-1">Name</label>
                  <input
                    id="commentName"
                    type="text"
                    required
                    autoComplete="name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="commentEmail" className="block text-sm text-gray-700 mb-1">Email</label>
                  <input
                    id="commentEmail"
                    type="email"
                    required
                    autoComplete="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="commentContent" className="block text-sm text-gray-700 mb-1">Comment</label>
                <textarea
                  id="commentContent"
                  rows={4}
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:opacity-50"
              >
                {isSubmittingComment ? 'Posting…' : 'Post Comment'}
              </button>
            </form>
          )}
        </section>
      </div>
    </>
  );
};

export default PlayerDetail;
