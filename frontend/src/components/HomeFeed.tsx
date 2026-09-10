import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, AlertTriangle, Eye, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { useHomeFeed, type HomeFeedItem } from '../hooks/useHomeFeed';

const PAGE_SIZE = 4;

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
  ' · ' +
  new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const isVideoLike = (item: HomeFeedItem): item is Extract<HomeFeedItem, { type: 'VIDEO' | 'LIVE' }> =>
  item.type === 'VIDEO' || item.type === 'LIVE';

const itemHref = (item: HomeFeedItem) => (item.type === 'POST' ? `/blog/${item.slug}` : item.url);

const categoryLabel = (item: HomeFeedItem) =>
  item.type === 'POST' ? item.category.replace(/_/g, ' ') : item.type === 'LIVE' ? 'Live' : 'Video';

const StatsRow: React.FC<{ item: HomeFeedItem }> = ({ item }) => (
  <div className="flex items-center gap-3 text-[11px] text-gray-400">
    <span>{formatDateTime(item.publishedAt)}</span>
    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views}</span>
    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {item.likes}</span>
    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.comments}</span>
  </div>
);

const FeaturedCard: React.FC<{ item: HomeFeedItem }> = ({ item }) => {
  const [playing, setPlaying] = useState(false);
  const isLive = item.type === 'LIVE';
  const video = isVideoLike(item);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {video && playing ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${item.id}?autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={item.thumbnail}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />

            {isLive && (
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 rounded-full shadow-lg w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  <span className="text-white text-[11px] font-black uppercase tracking-widest">Live</span>
                </div>
                <div className="w-7 h-7 flex items-center justify-center bg-red-600 rounded-md shadow-lg">
                  <AlertTriangle className="w-4 h-4 text-white" fill="currentColor" />
                </div>
              </div>
            )}

            {video && (
              <button
                onClick={() => setPlaying(true)}
                aria-label="Play video"
                className="absolute inset-0 flex items-center justify-center group"
              >
                <span className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600/90 shadow-2xl group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                  <Play className="w-7 h-7 md:w-8 md:h-8 text-white ml-1" fill="currentColor" />
                </span>
              </button>
            )}

            {!video && <Link to={itemHref(item)} className="absolute inset-0" aria-label={item.title} />}
          </>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start gap-3 mb-3">
          <span className="mt-2 w-2 h-2 rounded-full bg-red-600 shrink-0" />
          {video ? (
            <h3 className="text-lg md:text-xl font-bold text-gray-900 uppercase leading-snug">{item.title}</h3>
          ) : (
            <Link to={itemHref(item)} className="group/title">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 uppercase leading-snug group-hover/title:text-amber-700 transition-colors">
                {item.title}
              </h3>
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">{item.excerpt}</p>
        <StatsRow item={item} />
      </div>
    </div>
  );
};

const ReportCard: React.FC<{ item: HomeFeedItem }> = ({ item }) => {
  const video = isVideoLike(item);
  const card = (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full hover:shadow-md transition-shadow group">
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {video && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
            <span className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
              <Play className="w-4 h-4 text-red-600 ml-0.5" fill="currentColor" />
            </span>
          </span>
        )}
      </div>
      <div className="p-4">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 rounded px-2 py-0.5 mb-2">
          {categoryLabel(item)}
        </span>
        <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-3 group-hover:text-amber-700 transition-colors">
          {item.title}
        </h4>
        <StatsRow item={item} />
      </div>
    </div>
  );

  return video ? (
    <a href={itemHref(item)} target="_blank" rel="noopener noreferrer">{card}</a>
  ) : (
    <Link to={itemHref(item)}>{card}</Link>
  );
};

const HomeFeedSkeleton: React.FC = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="aspect-video bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </section>
);

const HomeFeed: React.FC = () => {
  const { featured, items, loading } = useHomeFeed(13);
  const [page, setPage] = useState(0);

  const pages = useMemo(() => {
    const chunks: HomeFeedItem[][] = [];
    for (let i = 0; i < items.length; i += PAGE_SIZE) {
      chunks.push(items.slice(i, i + PAGE_SIZE));
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [items]);

  const currentPage = Math.min(page, pages.length - 1);
  const visibleItems = pages[currentPage] || [];

  if (loading && !featured) {
    return <HomeFeedSkeleton />;
  }

  if (!featured) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Featured / Broadcast column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-gray-100 rounded-md text-xs font-black uppercase tracking-widest text-gray-900">
                  Broadcast
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Live Coverage
                </span>
              </div>
              <Link to="/posts" className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-amber-700 hover:text-amber-800 transition-colors">
                Full Coverage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <FeaturedCard item={featured} />
          </div>

          {/* Latest reports column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-amber-700">Latest Reports</h2>
              <Link to="/posts" className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
                All News <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleItems.map(item => (
                <ReportCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>

            {pages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    aria-label={`Show reports page ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === currentPage ? 'w-6 bg-amber-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFeed;
