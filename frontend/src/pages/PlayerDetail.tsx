import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';
import { useFetch, useCachedFetch } from '../hooks/useAPI';
import { Heart, MessageCircle, Tag, Calendar } from 'lucide-react';
import SEO from '../components/SEO';
import ShareButtons from '../components/ShareButtons';

const slotLabel = (slot?: string) => (slot === 'MORNING' ? 'Morning' : 'Evening');

const formattedFull = (dateString?: string) =>
  dateString
    ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

const PlayerDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();

  const { data, loading, error, refetch } = useCachedFetch<any>(
    id ? `episode:v1:${id}` : null,
    () => audioEpisodesAPI.getEpisode(id),
    { ttl: 5 * 60 * 1000 }
  );
  const episode: AudioEpisode | undefined = data?.data?.episode || data?.episode;

  // Recent episodes (sidebar list)
  const { data: recentData, loading: recentLoading } = useFetch<any>(() => audioEpisodesAPI.getEpisodes({ page: 1, limit: 11 } as any), []);
  const recentEpisodes = (recentData?.data?.episodes || recentData?.episodes || []).filter((e: any) => e.id !== id).slice(0, 10);

  // Comments
  const { data: commentsData, refetch: refetchComments } = useFetch<any>(
    () => (id ? audioEpisodesAPI.getComments(id) : Promise.resolve({ success: true, data: { comments: [] } })),
    [id]
  );
  const comments = commentsData?.data?.comments || commentsData?.comments || [];

  // Like state
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(episode?.likes || 0);
  const [isLiked, setIsLiked] = useState<boolean>(() => (id ? localStorage.getItem(`liked:episode:${id}`) === '1' : false));

  useEffect(() => {
    if (episode?.likes !== undefined) setLikeCount(episode.likes);
  }, [episode?.likes]);

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

  // Comment form state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingComment(true);
    try {
      await audioEpisodesAPI.addComment(id, { authorName, authorEmail, content: commentContent });
      setAuthorName('');
      setAuthorEmail('');
      setCommentContent('');
      refetchComments();
    } catch {
      // optionally show error toast
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formattedDate = useMemo(() => formattedFull(episode?.episodeDate), [episode?.episodeDate]);

  if (!episode && !loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-3">
            {error ? 'Error loading episode' : 'Episode not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find the episode you're looking for."}
          </p>
          {error && (
            <button onClick={refetch} className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800">Try again</button>
          )}
        </div>
      </div>
    );
  }

  const showSkeleton = loading || !episode;

  return (
    <div className="min-h-screen bg-white">
      {episode && (
        <SEO title={episode.title} description={episode.description} image={episode.coverImage} type="article" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          <Link to="/" className="hover:text-amber-700 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/players" className="hover:text-amber-700 transition-colors">Devotionals</Link>
          <span className="mx-2">/</span>
          {episode ? (
            <span className="text-amber-700">{slotLabel(episode.slot)}</span>
          ) : (
            <span className="inline-block h-3 w-20 bg-gray-200 rounded animate-pulse align-middle" />
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main column */}
          <article className="lg:col-span-2">
            {showSkeleton ? (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-4" />
                <div className="h-9 bg-gray-300 rounded animate-pulse w-3/4 mb-2" />
                <div className="h-9 bg-gray-300 rounded animate-pulse w-1/2 mb-4" />
                <div className="h-64 md:h-80 bg-gray-300 rounded-lg animate-pulse mb-6" />
                <div className="h-10 bg-gray-300 rounded animate-pulse mb-6" />
                <div className="h-4 bg-gray-300 rounded animate-pulse w-full mb-2" />
                <div className="h-4 bg-gray-300 rounded animate-pulse w-5/6 mb-6" />
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-300 animate-pulse shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 bg-gray-300 rounded animate-pulse" />
                      <div className="h-3 w-36 bg-gray-300 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-8 w-16 bg-gray-300 rounded-full animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                <span className="inline-block px-2.5 py-1 bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded mb-4">
                  {slotLabel(episode.slot)} Episode
                </span>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 leading-tight mb-4">
                  {episode.title}
                </h1>

                {episode.coverImage && (
                  <div className="relative w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={episode.coverImage}
                      alt={episode.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}

                <audio controls src={episode.audioUrl} className="w-full mb-6" />

                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line mb-6">{episode.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-800">A</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">Admin User</p>
                      <p className="text-gray-500">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-sm transition-colors ${isLiked ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-600 border-gray-200 hover:bg-gray-50'} ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={isLiked ? 'Unlike episode' : 'Like episode'}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} /> Like &middot; {likeCount}
                    </button>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600">
                      <MessageCircle className="w-4 h-4" /> Comment &middot; {comments.length}
                    </span>
                    <ShareButtons title={episode.title} />
                  </div>
                </div>

                {/* Comments */}
                <section className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                      Comments <span className="text-gray-400">&middot; {comments.length}</span>
                    </h2>
                  </div>

                  <div className="space-y-3 mb-8">
                    {comments.map((c: any) => (
                      <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold shrink-0">
                            {c.authorName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-gray-900">{c.authorName || 'Anonymous'}</span>
                              <span className="text-[11px] text-gray-400 shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-1.5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">No comments yet. Be the first to comment!</div>
                    )}
                  </div>

                  <form onSubmit={submitComment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="commentName" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Name</label>
                        <input
                          id="commentName"
                          name="commentName"
                          type="text"
                          required
                          autoComplete="name"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="commentEmail" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
                        <input
                          id="commentEmail"
                          name="commentEmail"
                          type="email"
                          required
                          autoComplete="email"
                          value={authorEmail}
                          onChange={(e) => setAuthorEmail(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="commentContent" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Comment</label>
                      <textarea
                        id="commentContent"
                        name="commentContent"
                        rows={4}
                        required
                        autoComplete="off"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="px-6 py-2.5 bg-amber-700 text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
                    >
                      {isSubmittingComment ? 'Posting…' : 'Post Comment'}
                    </button>
                  </form>
                </section>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            {/* Written By */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-4">Written By</h3>
              {!episode ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-2.5 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-amber-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-amber-800">A</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Admin User</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">The Bible Lover Author</p>
                  </div>
                </div>
              )}
            </div>

            {/* Episode Details */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-4">Episode Details</h3>
              {!episode ? (
                <dl className="space-y-1">
                  {[Tag, Calendar, Heart, MessageCircle].map((Icon, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <dt className="flex items-center gap-2 text-gray-500">
                        <Icon className="w-3.5 h-3.5 text-gray-300" />
                        <span className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                      </dt>
                      <dd className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </dl>
              ) : (
                <dl className="space-y-1">
                  {[
                    [Tag, 'Category', slotLabel(episode.slot)],
                    [Calendar, 'Published', formattedDate],
                    [Heart, 'Likes', likeCount],
                    [MessageCircle, 'Comments', comments.length]
                  ].map(([Icon, label, value]: any) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <dt className="flex items-center gap-2 text-gray-500 text-sm">
                        <Icon className="w-3.5 h-3.5 text-amber-700" />
                        {label}
                      </dt>
                      <dd className="font-bold text-gray-900 text-sm">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Recent Episodes */}
            {recentLoading && recentEpisodes.length === 0 && (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-3 w-24 bg-gray-300 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-300 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-md bg-gray-300 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 w-16 bg-gray-300 rounded animate-pulse" />
                        <div className="h-3.5 bg-gray-300 rounded animate-pulse w-full" />
                        <div className="h-3.5 bg-gray-300 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentEpisodes.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Recent Episodes</h3>
                  <Link to="/players" className="text-[10px] font-bold text-amber-700 uppercase tracking-widest hover:text-amber-800 transition-colors">
                    Listen More &rarr;
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentEpisodes.map((re: any) => (
                    <Link key={re.id} to={`/players/${re.id}`} className="flex items-start gap-3 group">
                      {re.coverImage && (
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                          <img src={re.coverImage} alt={re.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">
                          {slotLabel(re.slot)}
                        </span>
                        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                          {re.title}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-gray-400">
                            {formattedFull(re.episodeDate)}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {re.likes || 0} &middot; {re.commentsCount ?? 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
