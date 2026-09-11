import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';
import SEO from '../components/SEO';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Players: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const slotParam = searchParams.get('slot');
  const slot = slotParam === 'morning' ? 'MORNING' : slotParam === 'evening' ? 'EVENING' : undefined;

  const [episodes, setEpisodes] = useState<AudioEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    audioEpisodesAPI.getEpisodes({ slot, page, limit: 12 }).then((response) => {
      if (response.success && response.data) {
        setEpisodes(response.data.episodes);
        setTotalPages(response.data.pagination.totalPages);
      }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-6">All Episodes</h1>

        <div className="flex gap-3 mb-8">
          {[
            { label: 'All', value: null },
            { label: 'Morning', value: 'morning' as const },
            { label: 'Evening', value: 'evening' as const }
          ].map(tab => (
            <button
              key={tab.label}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition-colors ${
                (tab.value === null && !slotParam) || tab.value === slotParam
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />)}
          </div>
        ) : episodes.length === 0 ? (
          <p className="text-gray-500">No episodes found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map(episode => (
              <Link key={episode.id} to={`/players/${episode.id}`} className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                <div className="h-36 bg-gray-100">
                  <img src={episode.coverImage} alt={episode.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">{episode.slot}</span>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mt-1 mb-1">{episode.title}</h3>
                  <p className="text-[11px] text-gray-400">{formatDate(episode.episodeDate)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md text-xs font-bold ${p === page ? 'bg-amber-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
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
