import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, Pause, Heart, MoreVertical } from 'lucide-react';
import { useAudioEpisodes } from '../hooks/useAudioEpisodes';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';
import AutoText from './AutoText';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const useInlinePlayer = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = (episode: AudioEpisode) => {
    if (playingId === episode.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(episode.audioUrl);
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    audio.play();
    setPlayingId(episode.id);
  };

  return { playingId, toggle };
};

const LikeButton: React.FC<{ episode: AudioEpisode }> = ({ episode }) => {
  const [likes, setLikes] = useState(episode.likes);
  const [isLiked, setIsLiked] = useState(() => localStorage.getItem(`liked:episode:${episode.id}`) === '1');
  const [busy, setBusy] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (isLiked) {
        const res = await audioEpisodesAPI.unlikeEpisode(episode.id);
        if (res.success && res.data) setLikes(res.data.likes);
        setIsLiked(false);
        localStorage.removeItem(`liked:episode:${episode.id}`);
      } else {
        const res = await audioEpisodesAPI.likeEpisode(episode.id);
        if (res.success && res.data) setLikes(res.data.likes);
        setIsLiked(true);
        localStorage.setItem(`liked:episode:${episode.id}`, '1');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={handleLike} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors">
      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} /> {likes}
    </button>
  );
};

const BigCard: React.FC<{ episode: AudioEpisode; playingId: string | null; onToggle: (e: AudioEpisode) => void }> = ({ episode, playingId, onToggle }) => (
  <Link to={`/players/${episode.id}`} className="block bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm hover:border-gray-400 hover:shadow-md transition-all">
    <div className="relative h-40 md:h-64 bg-gray-100 dark:bg-white/10">
      <img src={episode.coverImage} alt={episode.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(episode); }}
        className="absolute bottom-2.5 right-2.5 md:bottom-4 md:right-4 w-9 h-9 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white"
      >
        {playingId === episode.id ? <Pause className="w-4 h-4 md:w-5 md:h-5 text-gray-900 dark:text-white" /> : <Play className="w-4 h-4 md:w-5 md:h-5 text-gray-900 dark:text-white ml-0.5" />}
      </button>
    </div>
    <div className="p-3 md:p-5">
      <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1.5 md:mb-2">{episode.title}</h4>
      <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{episode.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] md:text-xs text-gray-400 dark:text-gray-500">{formatDate(episode.episodeDate)}</span>
        <LikeButton episode={episode} />
      </div>
    </div>
  </Link>
);

const SmallCard: React.FC<{ episode: AudioEpisode }> = ({ episode }) => (
  <Link to={`/players/${episode.id}`} className="flex items-center gap-2.5 md:gap-4 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg p-2.5 md:p-3 shadow-sm hover:border-gray-400 hover:shadow-md transition-all">
    <img src={episode.coverImage} alt={episode.title} className="w-14 h-14 md:w-20 md:h-20 rounded object-cover shrink-0" loading="lazy" />
    <div className="min-w-0">
      <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">{episode.title}</p>
      <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mt-0.5 md:mt-1">{formatDate(episode.episodeDate)}</p>
    </div>
  </Link>
);

const AudioRow: React.FC<{ episode: AudioEpisode; playingId: string | null; onToggle: (e: AudioEpisode) => void }> = ({ episode, playingId, onToggle }) => {
  const isPlaying = playingId === episode.id;
  return (
    <Link
      to={`/players/${episode.id}`}
      className="flex items-center gap-3 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-2xl p-2.5 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
    >
      <img src={episode.coverImage} alt={episode.title} className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
      <div className="min-w-0 flex-1">
        <p className="font-sans text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">{episode.title}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(episode.episodeDate)} &middot; {formatTime(episode.episodeDate)}</p>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(episode); }}
        className="shrink-0 w-9 h-9 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-700 hover:bg-amber-700 hover:text-white hover:border-amber-700 transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <span className="shrink-0 text-gray-400 dark:text-gray-500">
        <MoreVertical className="w-4 h-4" />
      </span>
    </Link>
  );
};

const DeskColumn: React.FC<{ label: string; slot: 'MORNING' | 'EVENING'; episodes: AudioEpisode[]; playingId: string | null; onToggle: (e: AudioEpisode) => void }> = ({ label, slot, episodes, playingId, onToggle }) => {
  const [big, small] = episodes;
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5 md:mb-3">
        <AutoText as="h3" className="text-xs md:text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white">{label}</AutoText>
        <Link to={`/players?slot=${slot.toLowerCase()}`} className="px-2 py-0.5 md:px-2.5 md:py-1 bg-gray-100 dark:bg-white/10 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors">
          Desk <ChevronRight className="inline w-3 h-3" />
        </Link>
      </div>
      {big ? (
        <>
          {/* Mobile: dark audio-row cards */}
          <div className="md:hidden space-y-2.5">
            <AudioRow episode={big} playingId={playingId} onToggle={onToggle} />
            {small && <AudioRow episode={small} playingId={playingId} onToggle={onToggle} />}
          </div>
          {/* Desktop: big/small card layout */}
          <div className="hidden md:block space-y-3">
            <BigCard episode={big} playingId={playingId} onToggle={onToggle} />
            {small && <SmallCard episode={small} />}
          </div>
        </>
      ) : (
        <div className="h-40 md:h-64 flex items-center justify-center text-center text-xs md:text-sm text-gray-400 dark:text-gray-500 bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/10 rounded-lg">
          No {label.toLowerCase()} episodes yet
        </div>
      )}
    </div>
  );
};

const PlayerDesk: React.FC = () => {
  const { episodes, hasLoaded, error } = useAudioEpisodes(20);
  const { playingId, toggle } = useInlinePlayer();

  const morning = useMemo(() => episodes.filter(e => e.slot === 'MORNING').slice(0, 2), [episodes]);
  const evening = useMemo(() => episodes.filter(e => e.slot === 'EVENING').slice(0, 2), [episodes]);

  if (error) return null;
  if (hasLoaded && episodes.length === 0) return null;

  return (
    <section className="py-4 md:py-20 bg-white dark:bg-transparent isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 md:gap-6 mb-4 md:mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <span className="w-1 h-4 bg-amber-700 rounded-sm" />
              <AutoText as="span" className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-700">Player Desk</AutoText>
            </div>
            <AutoText as="h2" className="text-xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Morning &amp; Evening</AutoText>
            <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mt-2">Short audio devotionals to start and close your day</p>
          </div>
          <Link
            to="/players"
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 border border-gray-300 dark:border-white/10 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shrink-0"
          >
            All Episodes <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </Link>
        </div>

        {!hasLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {[1, 2].map(i => (
              <div key={i} className="h-40 md:h-64 bg-gray-200 dark:bg-white/10 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <DeskColumn label="Morning Prayer" slot="MORNING" episodes={morning} playingId={playingId} onToggle={toggle} />
            <DeskColumn label="Evening Prayer" slot="EVENING" episodes={evening} playingId={playingId} onToggle={toggle} />
          </div>
        )}
      </div>
    </section>
  );
};

export default PlayerDesk;
