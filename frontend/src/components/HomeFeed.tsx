import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Radio, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useHomeFeed, type HomeFeedItem } from '../hooks/useHomeFeed';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const isVideoLike = (item: HomeFeedItem): item is Extract<HomeFeedItem, { type: 'VIDEO' | 'LIVE' }> =>
  item.type === 'VIDEO' || item.type === 'LIVE';

const itemHref = (item: HomeFeedItem) => (item.type === 'POST' ? `/blog/${item.slug}` : item.url);

const FeaturedCard: React.FC<{ item: HomeFeedItem }> = ({ item }) => {
  const [playing, setPlaying] = useState(false);
  const isLive = item.type === 'LIVE';
  const video = isVideoLike(item);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-gray-900/5 border border-gray-100 bg-white group">
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
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
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {isLive && (
              <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 rounded-full shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="text-white text-xs font-black uppercase tracking-widest">Live</span>
              </div>
            )}

            {video && (
              <button
                onClick={() => setPlaying(true)}
                aria-label="Play video"
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                  <Play className="w-7 h-7 md:w-8 md:h-8 text-amber-700 ml-1" fill="currentColor" />
                </span>
              </button>
            )}

            {!video && (
              <Link to={itemHref(item)} className="absolute inset-0" aria-label={item.title} />
            )}
          </>
        )}
      </div>

      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          {video ? (
            <span className="flex items-center gap-1.5 text-amber-700">
              <Radio className="w-3.5 h-3.5" /> {isLive ? 'Live Broadcast' : 'YouTube'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-700">
              <BookOpen className="w-3.5 h-3.5" /> {item.category}
            </span>
          )}
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {formatDate(item.publishedAt)}
          </span>
        </div>

        {video ? (
          <h3 className="text-xl md:text-2xl font-serif text-gray-900 leading-snug">{item.title}</h3>
        ) : (
          <Link to={itemHref(item)} className="block group/title">
            <h3 className="text-xl md:text-2xl font-serif text-gray-900 leading-snug group-hover/title:text-amber-700 transition-colors">
              {item.title}
            </h3>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-2">{item.excerpt}</p>
          </Link>
        )}
      </div>
    </div>
  );
};

const SmallCard: React.FC<{ item: HomeFeedItem }> = ({ item }) => {
  const video = isVideoLike(item);
  const inner = (
    <div className="flex gap-4 p-3 rounded-2xl hover:bg-amber-50/60 transition-colors group">
      <div className="relative shrink-0 w-28 h-20 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {video && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
            <Play className="w-5 h-5 text-white drop-shadow" fill="currentColor" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">
          {video ? 'YouTube' : item.category}
        </span>
        <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
          {item.title}
        </h4>
        <span className="text-[11px] text-gray-400 mt-1">{formatDate(item.publishedAt)}</span>
      </div>
    </div>
  );

  return video ? (
    <a href={itemHref(item)} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <Link to={itemHref(item)}>{inner}</Link>
  );
};

const HomeFeedSkeleton: React.FC = () => (
  <section className="py-20 bg-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 h-4 w-40 bg-gray-100 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 aspect-video bg-gray-100 rounded-3xl animate-pulse" />
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </section>
);

const HomeFeed: React.FC = () => {
  const { featured, items, loading } = useHomeFeed(6);

  if (loading && !featured) {
    return <HomeFeedSkeleton />;
  }

  if (!featured) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-sm tracking-widest uppercase text-gray-500">Latest From Us</h2>
          <Link to="/posts" className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <FeaturedCard item={featured} />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
            {items.map(item => (
              <SmallCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFeed;
