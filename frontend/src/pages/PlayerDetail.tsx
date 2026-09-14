import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';
import { useFetch, useCachedFetch } from '../hooks/useAPI';
import { Heart, MessageCircle, Tag, Calendar, Share2, Download, Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import ShareModal from '../components/ShareModal';
import AutoText from '../components/AutoText';

const slotLabel = (slot?: string) => (slot === 'MORNING' ? 'Morning' : 'Evening');

const formattedFull = (dateString?: string) =>
  dateString
    ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

const formatSeconds = (seconds: number) => {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Mobile-only full player card - matches the reference's layout (cover
// art, icon row, title/subtitle, seek bar, transport controls) but
// recolored to the site's own white/amber palette instead of the
// reference's dark theme.
const MobileAudioPlayer: React.FC<{
  episode: AudioEpisode;
  prevHref?: string;
  nextHref?: string;
  onShare: () => void;
  formattedDate: string;
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
}> = ({ episode, prevHref, nextHref, onShare, formattedDate, isLiked, likeCount, onLike }) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play(); else audio.pause();
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + seconds, 0), duration || audio.duration || 0);
  };

  const seekTo = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="md:hidden bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mb-6">
      <audio
        ref={audioRef}
        src={episode.audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {episode.coverImage && (
        <div className="relative w-full h-56">
          <img src={episode.coverImage} alt={episode.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={onLike}
              aria-label={isLiked ? 'Unlike episode' : 'Like episode'}
              className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-sm transition-colors ${isLiked ? 'bg-red-600/90 text-white' : 'bg-black/40 text-white hover:bg-black/55'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onShare}
              aria-label="Share"
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white shadow-sm hover:bg-black/55 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={episode.audioUrl}
              download
              aria-label="Download"
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white shadow-sm hover:bg-black/55 transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
          {likeCount > 0 && (
            <span className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" /> {likeCount}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="text-center mb-3">
          <h1 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white leading-snug">{episode.title}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{slotLabel(episode.slot)} Devotional</p>
        </div>

        <div className="mb-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full h-1.5 accent-amber-700 cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 mb-4">
          <span>{formatSeconds(currentTime)}</span>
          <span>{formatSeconds(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-5">
          <button onClick={() => skip(-10)} aria-label="Rewind 10 seconds" className="text-gray-500 dark:text-gray-400 hover:text-amber-700 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
          {prevHref ? (
            <Link to={prevHref} aria-label="Previous episode" className="text-gray-500 dark:text-gray-400 hover:text-amber-700 transition-colors">
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </Link>
          ) : (
            <span className="text-gray-200"><SkipBack className="w-5 h-5" fill="currentColor" /></span>
          )}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-14 h-14 rounded-full bg-amber-700 hover:bg-amber-800 text-white flex items-center justify-center shadow-md transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-0.5" fill="currentColor" />}
          </button>
          {nextHref ? (
            <Link to={nextHref} aria-label="Next episode" className="text-gray-500 dark:text-gray-400 hover:text-amber-700 transition-colors">
              <SkipForward className="w-5 h-5" fill="currentColor" />
            </Link>
          ) : (
            <span className="text-gray-200"><SkipForward className="w-5 h-5" fill="currentColor" /></span>
          )}
          <button onClick={() => skip(10)} aria-label="Forward 10 seconds" className="text-gray-500 dark:text-gray-400 hover:text-amber-700 transition-colors">
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-3.5 bg-amber-700 rounded-sm" />
            <AutoText as="span" className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">About this Episode</AutoText>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line mb-4">{episode.description}</p>

          <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100 dark:border-white/5">
            <div className="w-9 h-9 bg-amber-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-amber-800">A</span>
            </div>
            <div className="text-xs">
              <AutoText as="p" className="font-bold text-gray-900 dark:text-white">Admin User</AutoText>
              <p className="text-gray-500 dark:text-gray-400">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const allEpisodes = recentData?.data?.episodes || recentData?.episodes || [];
  const recentEpisodes = allEpisodes.filter((e: any) => e.id !== id).slice(0, 5);

  // Previous/next episode (mobile player's transport controls) - ordered
  // chronologically so "next" always means the newer episode.
  const { prevEpisodeId, nextEpisodeId } = useMemo(() => {
    const sorted = [...allEpisodes].sort((a: any, b: any) => new Date(a.episodeDate).getTime() - new Date(b.episodeDate).getTime());
    const index = sorted.findIndex((e: any) => e.id === id);
    if (index === -1) return { prevEpisodeId: undefined, nextEpisodeId: undefined };
    return {
      prevEpisodeId: index > 0 ? sorted[index - 1].id : undefined,
      nextEpisodeId: index < sorted.length - 1 ? sorted[index + 1].id : undefined
    };
  }, [allEpisodes, id]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const handleShare = () => setIsShareModalOpen(true);

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
      <div className="min-h-screen bg-white dark:bg-[#141417]">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <AutoText as="h1" className="text-2xl font-serif text-gray-900 dark:text-white mb-3">
            {error ? 'Error loading episode' : 'Episode not found'}
          </AutoText>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || <AutoText as="span">We couldn't find the episode you're looking for.</AutoText>}
          </p>
          {error && (
            <button onClick={refetch} className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"><AutoText>Try again</AutoText></button>
          )}
        </div>
      </div>
    );
  }

  const showSkeleton = loading || !episode;

  return (
    <div className="min-h-screen bg-white dark:bg-[#141417]">
      {episode && (
        <SEO title={episode.title} description={episode.description} image={episode.coverImage} type="article" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-10">
        <Link
          to="/players"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-amber-700 transition-colors mb-3 md:mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> <AutoText as="span">Back to Devotionals</AutoText>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-10">
          {/* Main column */}
          <article className="lg:col-span-2">
            {showSkeleton ? (
              <>
                <div className="md:hidden bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mb-4">
                  <div className="h-56 bg-gray-300 dark:bg-white/10 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-2/3 bg-gray-300 dark:bg-white/10 rounded animate-pulse mx-auto" />
                    <div className="h-3 w-1/3 bg-gray-200 dark:bg-white/10 rounded animate-pulse mx-auto" />
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="flex items-center justify-center gap-5 py-1">
                      <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                      <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                      <div className="h-14 w-14 bg-gray-300 dark:bg-white/10 rounded-full animate-pulse" />
                      <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                      <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                    </div>
                    <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-2">
                      <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      <div className="h-3.5 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      <div className="h-3.5 w-5/6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      <div className="flex items-center gap-2.5 pt-2">
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                          <div className="h-2.5 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-6 md:p-8 mb-8">
                  <div className="h-6 w-32 bg-gray-300 dark:bg-white/10 rounded animate-pulse mb-4" />
                  <div className="h-9 bg-gray-300 dark:bg-white/10 rounded animate-pulse w-3/4 mb-2" />
                  <div className="h-9 bg-gray-300 dark:bg-white/10 rounded animate-pulse w-1/2 mb-4" />
                  <div className="h-64 md:h-80 bg-gray-300 dark:bg-white/10 rounded-lg animate-pulse mb-6" />
                  <div className="h-10 bg-gray-300 dark:bg-white/10 rounded animate-pulse mb-6" />
                  <div className="h-4 bg-gray-300 dark:bg-white/10 rounded animate-pulse w-full mb-2" />
                  <div className="h-4 bg-gray-300 dark:bg-white/10 rounded animate-pulse w-5/6 mb-6" />
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-white/10 animate-pulse shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-gray-300 dark:bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-36 bg-gray-300 dark:bg-white/10 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 w-16 bg-gray-300 dark:bg-white/10 rounded-full animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <MobileAudioPlayer
                  episode={episode}
                  prevHref={prevEpisodeId ? `/players/${prevEpisodeId}` : undefined}
                  nextHref={nextEpisodeId ? `/players/${nextEpisodeId}` : undefined}
                  onShare={handleShare}
                  formattedDate={formattedDate}
                  isLiked={isLiked}
                  likeCount={likeCount}
                  onLike={handleLike}
                />
              <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-8 mb-4 md:mb-8">
                <span className="hidden md:inline-block px-2.5 py-1 bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded mb-4">
                  {slotLabel(episode.slot)} Episode
                </span>
                <h1 className="hidden md:block text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight mb-4">
                  {episode.title}
                </h1>

                {episode.coverImage && (
                  <div className="hidden md:block relative w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
                    <img
                      src={episode.coverImage}
                      alt={episode.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}

                <audio controls src={episode.audioUrl} className="hidden md:block w-full mb-6" />

                <p className="hidden md:block text-sm md:text-lg text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line mb-4 md:mb-6">{episode.description}</p>

                <div className="hidden md:flex flex-wrap items-center justify-between gap-3 md:gap-4 pb-4 md:pb-6 mb-4 md:mb-6 border-b border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-amber-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-800">A</span>
                    </div>
                    <div className="text-xs md:text-sm">
                      <AutoText as="p" className="font-bold text-gray-900 dark:text-white">Admin User</AutoText>
                      <p className="text-gray-500 dark:text-gray-400">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 border rounded-full text-xs md:text-sm transition-colors ${isLiked ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50'} ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={isLiked ? 'Unlike episode' : 'Like episode'}
                    >
                      <Heart className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isLiked ? 'fill-current' : ''}`} /> <AutoText as="span">Like</AutoText> &middot; {likeCount}
                    </button>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-full text-sm text-gray-600 dark:text-gray-300">
                      <MessageCircle className="w-4 h-4" /> <AutoText as="span">Comment</AutoText> &middot; {comments.length}
                    </span>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors"
                      aria-label="Share episode"
                    >
                      <Share2 className="w-4 h-4" /> <AutoText as="span">Share</AutoText>
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <section className="mt-6 pt-6 md:mt-8 md:pt-8 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                      <AutoText as="span">Comments</AutoText> <span className="text-gray-400 dark:text-gray-500">&middot; {comments.length}</span>
                    </h2>
                  </div>

                  <div className="space-y-2.5 md:space-y-3 mb-6 md:mb-8">
                    {comments.map((c: any) => (
                      <div key={c.id} className="border border-gray-200 dark:border-white/10 rounded-lg p-3 md:p-4 bg-gray-50 dark:bg-white/5">
                        <div className="flex items-start gap-2.5 md:gap-3">
                          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs md:text-sm font-bold shrink-0">
                            {c.authorName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{c.authorName || <AutoText as="span">Anonymous</AutoText>}</span>
                              <span className="text-[10px] md:text-[11px] text-gray-400 dark:text-gray-500 shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-1 md:mt-1.5 text-xs md:text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <AutoText as="div" className="border border-dashed border-gray-300 dark:border-white/10 rounded-lg p-4 md:p-6 text-center text-gray-500 dark:text-gray-400 text-xs md:text-sm">No comments yet. Be the first to comment!</AutoText>
                    )}
                  </div>

                  <form onSubmit={submitComment} className="space-y-2.5 md:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4">
                      <div>
                        <label htmlFor="commentName" className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 md:mb-1.5"><AutoText>Name</AutoText></label>
                        <input
                          id="commentName"
                          name="commentName"
                          type="text"
                          required
                          autoComplete="name"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="w-full px-2.5 md:px-3 py-1.5 md:py-2.5 border border-gray-300 dark:border-white/10 rounded-md text-xs md:text-sm focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="commentEmail" className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 md:mb-1.5"><AutoText>Email</AutoText></label>
                        <input
                          id="commentEmail"
                          name="commentEmail"
                          type="email"
                          required
                          autoComplete="email"
                          value={authorEmail}
                          onChange={(e) => setAuthorEmail(e.target.value)}
                          className="w-full px-2.5 md:px-3 py-1.5 md:py-2.5 border border-gray-300 dark:border-white/10 rounded-md text-xs md:text-sm focus:border-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="commentContent" className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 md:mb-1.5"><AutoText>Comment</AutoText></label>
                      <textarea
                        id="commentContent"
                        name="commentContent"
                        rows={4}
                        required
                        autoComplete="off"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="w-full px-2.5 md:px-3 py-1.5 md:py-2.5 border border-gray-300 dark:border-white/10 rounded-md text-xs md:text-sm focus:border-amber-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="w-full sm:w-auto px-5 md:px-6 py-2 md:py-2.5 bg-amber-700 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
                    >
                      {isSubmittingComment ? <AutoText as="span">Posting…</AutoText> : <AutoText as="span">Post Comment</AutoText>}
                    </button>
                  </form>
                </section>
              </div>
              </>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4 md:space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            {/* Written By - desktop only, purely informational and redundant with the author row already shown above */}
            <div className="hidden md:block bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-5">
              <AutoText as="h3" className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-4">Written By</AutoText>
              {!episode ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="h-2.5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-amber-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-amber-800">A</span>
                  </div>
                  <div>
                    <AutoText as="p" className="font-bold text-gray-900 dark:text-white text-sm">Admin User</AutoText>
                    <AutoText as="p" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">The Bible Lover Author</AutoText>
                  </div>
                </div>
              )}
            </div>

            {/* Episode Details */}
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-5">
              <AutoText as="h3" className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-3 md:mb-4">Episode Details</AutoText>
              {!episode ? (
                <dl className="space-y-1">
                  {[Tag, Calendar, Heart, MessageCircle].map((Icon, i) => (
                    <div key={i} className="flex items-center justify-between py-2 md:py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0">
                      <dt className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Icon className="w-3.5 h-3.5 text-gray-300" />
                        <span className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      </dt>
                      <dd className="h-3 w-10 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
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
                    <div key={label} className="flex items-center justify-between py-2 md:py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0">
                      <dt className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                        <Icon className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-700" />
                        <AutoText as="span">{label}</AutoText>
                      </dt>
                      <dd className="font-bold text-gray-900 dark:text-white text-xs md:text-sm">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Recent Episodes */}
            {recentLoading && recentEpisodes.length === 0 && (
              <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-5">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="h-3 w-24 bg-gray-300 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-300 dark:bg-white/10 rounded animate-pulse" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-start gap-2.5 md:gap-3">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-md bg-gray-300 dark:bg-white/10 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 w-16 bg-gray-300 dark:bg-white/10 rounded animate-pulse" />
                        <div className="h-3.5 bg-gray-300 dark:bg-white/10 rounded animate-pulse w-full" />
                        <div className="h-3.5 bg-gray-300 dark:bg-white/10 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentEpisodes.length > 0 && (
              <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-5">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <AutoText as="h3" className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-700">Recent Episodes</AutoText>
                  <Link to="/players" className="text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-widest hover:text-amber-800 transition-colors">
                    <AutoText as="span">Listen More</AutoText> &rarr;
                  </Link>
                </div>
                {/* Mobile: audio-row style, matching the Home page's Player Desk */}
                <div className="md:hidden space-y-2.5">
                  {recentEpisodes.map((re: any) => (
                    <Link
                      key={re.id}
                      to={`/players/${re.id}`}
                      className="flex items-center gap-3 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-2xl p-2.5 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
                    >
                      {re.coverImage && (
                        <img src={re.coverImage} alt={re.title} className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">{re.title}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{formattedFull(re.episodeDate)} &middot; {slotLabel(re.slot)}</p>
                      </div>
                      <span className="shrink-0 w-9 h-9 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-700">
                        <Play className="w-4 h-4 ml-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Desktop: thumbnail + text row */}
                <div className="hidden md:block space-y-4">
                  {recentEpisodes.map((re: any) => (
                    <Link key={re.id} to={`/players/${re.id}`} className="flex items-start gap-3 group">
                      {re.coverImage && (
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-white/10 shrink-0">
                          <img src={re.coverImage} alt={re.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">
                          {slotLabel(re.slot)}
                        </span>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                          {re.title}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            {formattedFull(re.episodeDate)}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">
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

      {episode && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={episode.title}
          heading="Share This Episode"
        />
      )}
    </div>
  );
};

export default PlayerDetail;
