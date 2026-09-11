import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, Pause, Heart } from 'lucide-react';
import { useAudioEpisodes } from '../hooks/useAudioEpisodes';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
    <button onClick={handleLike} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors">
      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} /> {likes}
    </button>
  );
};

const BigCard: React.FC<{ episode: AudioEpisode; playingId: string | null; onToggle: (e: AudioEpisode) => void }> = ({ episode, playingId, onToggle }) => (
  <Link to={`/players/${episode.id}`} className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
    <div className="relative h-64 bg-gray-100">
      <img src={episode.coverImage} alt={episode.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(episode); }}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white"
      >
        {playingId === episode.id ? <Pause className="w-5 h-5 text-gray-900" /> : <Play className="w-5 h-5 text-gray-900 ml-0.5" />}
      </button>
    </div>
    <div className="p-5">
      <h4 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 mb-2">{episode.title}</h4>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{episode.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{formatDate(episode.episodeDate)}</span>
        <LikeButton episode={episode} />
      </div>
    </div>
  </Link>
);

const SmallCard: React.FC<{ episode: AudioEpisode }> = ({ episode }) => (
  <Link to={`/players/${episode.id}`} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
    <img src={episode.coverImage} alt={episode.title} className="w-20 h-20 rounded object-cover shrink-0" loading="lazy" />
    <div className="min-w-0">
      <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{episode.title}</p>
      <p className="text-xs text-gray-400 mt-1">{formatDate(episode.episodeDate)}</p>
    </div>
  </Link>
);

const DeskColumn: React.FC<{ label: string; slot: 'MORNING' | 'EVENING'; episodes: AudioEpisode[]; playingId: string | null; onToggle: (e: AudioEpisode) => void }> = ({ label, slot, episodes, playingId, onToggle }) => {
  const [big, small] = episodes;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-gray-900">{label}</h3>
        <Link to={`/players?slot=${slot.toLowerCase()}`} className="px-2.5 py-1 bg-gray-100 rounded-md text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-200 transition-colors">
          Desk <ChevronRight className="inline w-3 h-3" />
        </Link>
      </div>
      {big ? (
        <div className="space-y-3">
          <BigCard episode={big} playingId={playingId} onToggle={onToggle} />
          {small && <SmallCard episode={small} />}
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-center text-sm text-gray-400 bg-white border border-dashed border-gray-200 rounded-lg">
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-4 bg-amber-700 rounded-sm" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Player Desk</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">Morning &amp; Evening</h2>
            <p className="text-sm text-gray-500 mt-2">Short audio devotionals to start and close your day</p>
          </div>
          <Link
            to="/players"
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-md text-xs font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
          >
            All Episodes <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!hasLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DeskColumn label="Morning" slot="MORNING" episodes={morning} playingId={playingId} onToggle={toggle} />
            <DeskColumn label="Evening" slot="EVENING" episodes={evening} playingId={playingId} onToggle={toggle} />
          </div>
        )}
      </div>
    </section>
  );
};

export default PlayerDesk;
