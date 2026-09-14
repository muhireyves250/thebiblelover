import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';
import SEO from '../components/SEO';
import AutoText from '../components/AutoText';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Players: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const slotParam = searchParams.get('slot');
  const slot = slotParam === 'morning' ? 'MORNING' : slotParam === 'evening' ? 'EVENING' : undefined;

  const [episodes, setEpisodes] = useState<AudioEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    audioEpisodesAPI.getEpisodes({ slot, page, limit: 12 }).then((response) => {
      if (response.success && response.data) {
        setEpisodes(response.data.episodes);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setLoadError(true);
      }
      setLoading(false);
    }).catch(() => {
      setLoadError(true);
      setLoading(false);
    });
  }, [slot, page]);

  const setFilter = (value: 'morning' | 'evening' | null) => {
    setPage(1);
    if (value) {
      setSearchParams({ slot: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <SEO title="Morning & Evening Episodes" description="Browse all morning and evening audio devotionals." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16">
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-4 bg-amber-700 rounded-sm" />
            <AutoText as="span" className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Devotionals</AutoText>
          </div>
          <AutoText as="h1" className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">All Episodes</AutoText>
          <AutoText as="p" className="text-sm text-gray-500 dark:text-gray-400 mt-2">Browse all morning and evening audio devotionals.</AutoText>
        </div>

        <div className="flex gap-2 md:gap-3 mb-6 md:mb-8 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { label: 'All', value: null },
            { label: 'Morning', value: 'morning' as const },
            { label: 'Evening', value: 'evening' as const }
          ].map(tab => (
            <button
              key={tab.label}
              onClick={() => setFilter(tab.value)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${
                (tab.value === null && !slotParam) || tab.value === slotParam
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-white dark:bg-[#141417] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300'
              }`}
            >
              <AutoText as="span">{tab.label}</AutoText>
            </button>
          ))}
        </div>

        {loading ? (
          <>
            <div className="md:hidden space-y-2.5">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[76px] bg-gray-200 dark:bg-white/10 animate-pulse rounded-2xl" />)}
            </div>
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-white/10 animate-pulse rounded-lg" />)}
            </div>
          </>
        ) : loadError ? (
          <AutoText as="p" className="text-gray-500 dark:text-gray-400">Failed to load episodes. Please try again later.</AutoText>
        ) : episodes.length === 0 ? (
          <AutoText as="p" className="text-gray-500 dark:text-gray-400">No episodes found.</AutoText>
        ) : (
          <>
            {/* Mobile: audio-row style, matching Home's Player Desk */}
            <div className="md:hidden space-y-2.5">
              {episodes.map(episode => (
                <Link
                  key={episode.id}
                  to={`/players/${episode.id}`}
                  className="flex items-center gap-3 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-2xl p-2.5 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
                >
                  <img src={episode.coverImage} alt={episode.title} className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">{episode.title}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(episode.episodeDate)} &middot; {episode.slot}</p>
                  </div>
                  <span className="shrink-0 w-9 h-9 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-700">
                    <Play className="w-4 h-4 ml-0.5" />
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop: grid cards */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes.map(episode => (
                <Link key={episode.id} to={`/players/${episode.id}`} className="block bg-white dark:bg-[#141417] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                  <div className="h-36 bg-gray-100 dark:bg-white/10">
                    <img src={episode.coverImage} alt={episode.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">{episode.slot}</span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mt-1 mb-1">{episode.title}</h3>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{formatDate(episode.episodeDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md text-xs font-bold ${p === page ? 'bg-amber-700 text-white' : 'bg-white dark:bg-[#141417] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Players;
