import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, AlertTriangle, Eye, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { useHomeFeed, type HomeFeedItem } from '../hooks/useHomeFeed';
import { useContentSettings } from '../hooks/useContentSettings';

const PAGE_SIZE = 4;
const AUTO_ROTATE_MS = 6000;
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/channel/UCnZWkIVSWJwiFW6RhQLDgaA';

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
  <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
    <span className="text-[11px] text-gray-400">{formatDateTime(item.publishedAt)}</span>
    <div className="flex items-center gap-3 text-[11px] text-gray-400">
      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views}</span>
      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {item.likes}</span>
      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.comments}</span>
    </div>
  </div>
);

const FeaturedCard: React.FC<{ item: HomeFeedItem }> = ({ item }) => {
  const [playing, setPlaying] = useState(false);
  const isLive = item.type === 'LIVE';
  const video = isVideoLike(item);

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative flex-1 min-h-[220px] bg-gray-100 overflow-hidden">
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
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-full hover:border-gray-300 transition-colors group">
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
        <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-2">
          {categoryLabel(item)}
        </span>
        <h4 className="text-sm font-bold text-gray-900 uppercase leading-snug line-clamp-2 mb-1 group-hover:text-amber-700 transition-colors">
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

// Fallback for the Watch slot when nothing's live and there's no recent
// upload yet — reuses the video already configured in the Hero section.
// Mirrors FeaturedCard's exact shell (image area, play button, headline
// row, copy block) so the card doesn't change shape depending on source.
const HeroVideoCard: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative flex-1 min-h-[220px] bg-gray-100 overflow-hidden">
        {playing ? (
          <video
            src={videoUrl}
            autoPlay
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              src={videoUrl}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <button
              onClick={() => setPlaying(true)}
              aria-label="Play video"
              className="absolute inset-0 flex items-center justify-center group"
            >
              <span className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600/90 shadow-2xl group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                <Play className="w-7 h-7 md:w-8 md:h-8 text-white ml-1" fill="currentColor" />
              </span>
            </button>
          </>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start gap-3 mb-3">
          <span className="mt-2 w-2 h-2 rounded-full bg-red-600 shrink-0" />
          <h3 className="text-lg md:text-xl font-bold text-gray-900 uppercase leading-snug">
            A Word While You Wait
          </h3>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          We're not live right now, but take a moment with this reflection from The Bible Lover.
          Check back soon for our next broadcast, or explore our channel for more teachings.
        </p>
      </div>
    </div>
  );
};

const NoVideoPlaceholder: React.FC = () => (
  <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
    <div className="flex-1 min-h-[220px] bg-gray-50 flex flex-col items-center justify-center text-center px-8">
      <span className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <Play className="w-6 h-6 text-amber-700 ml-0.5" fill="currentColor" />
      </span>
      <p className="text-sm font-bold text-gray-700 mb-1">No live stream right now</p>
      <p className="text-xs text-gray-400 mb-4">Check our channel for the latest videos and teachings.</p>
      <a
        href={YOUTUBE_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-black uppercase tracking-widest text-amber-700 hover:text-amber-800 transition-colors"
      >
        Visit Our Channel
      </a>
    </div>
  </div>
);

const ReportCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full">
    <div className="h-36 bg-gray-300 animate-pulse" />
    <div className="p-4">
      <div className="h-4 w-20 bg-gray-300 rounded animate-pulse mb-3" />
      <div className="h-4 w-full bg-gray-300 rounded animate-pulse mb-2" />
      <div className="h-4 w-2/3 bg-gray-300 rounded animate-pulse mb-4" />
      <div className="h-3 w-3/4 bg-gray-300 rounded animate-pulse" />
    </div>
  </div>
);

const FeaturedCardSkeleton: React.FC = () => (
  <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
    <div className="flex-1 min-h-[220px] bg-gray-300 animate-pulse" />
    <div className="p-6">
      <div className="flex items-start gap-3 mb-3">
        <span className="mt-2 w-2 h-2 rounded-full bg-gray-200 shrink-0" />
        <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse" />
      </div>
      <div className="h-4 w-full bg-gray-300 rounded animate-pulse mb-2" />
      <div className="h-4 w-5/6 bg-gray-300 rounded animate-pulse mb-4" />
      <div className="h-3 w-1/2 bg-gray-300 rounded animate-pulse" />
    </div>
  </div>
);

const NoReflectionsYet: React.FC = () => (
  <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center bg-white rounded-xl border border-dashed border-gray-200 px-8">
    <p className="text-sm font-bold text-gray-700 mb-1">No reflections yet</p>
    <p className="text-xs text-gray-400">Check back soon — new posts will show up here.</p>
  </div>
);

const HomeFeed: React.FC = () => {
  const { featured, items, hasLoaded } = useHomeFeed(13);
  const { settings } = useContentSettings();
  const heroVideoUrl = settings?.heroSection?.videoUrl;
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

  // Auto-rotate through pages of reflections; pause while the visitor is
  // hovering the grid so it doesn't yank a card out from under the cursor.
  const [isHovering, setIsHovering] = useState(false);
  useEffect(() => {
    if (pages.length <= 1 || isHovering) return;
    const interval = setInterval(() => {
      setPage(p => (p + 1) % pages.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [pages.length, isHovering]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Featured / Broadcast column */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-gray-100 rounded-md text-xs font-black uppercase tracking-widest text-gray-900">
                  Watch
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Live Stream
                </span>
              </div>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-amber-700 hover:text-amber-800 transition-colors"
              >
                Watch More <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex-1">
              {!hasLoaded ? (
                <FeaturedCardSkeleton />
              ) : featured ? (
                <FeaturedCard item={featured} />
              ) : heroVideoUrl ? (
                <HeroVideoCard videoUrl={heroVideoUrl} />
              ) : (
                <NoVideoPlaceholder />
              )}
            </div>
          </div>

          {/* Latest reflections column */}
          <div
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-amber-700 whitespace-nowrap">Latest Reflections</h2>
              <Link to="/posts" className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="relative overflow-hidden pr-6 min-h-[1100px] sm:min-h-[560px]">
              {!hasLoaded ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <ReportCardSkeleton key={i} />
                  ))}
                </div>
              ) : visibleItems.length === 0 ? (
                <NoReflectionsYet />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {visibleItems.map(item => (
                      <ReportCard key={`${item.type}-${item.id}`} item={item} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              {Array.from({ length: Math.max(pages.length, 3) }).map((_, i) => {
                const isRealPage = i < pages.length;
                return (
                  <button
                    key={i}
                    onClick={() => isRealPage && setPage(i)}
                    disabled={!isRealPage}
                    aria-label={isRealPage ? `Show reports page ${i + 1}` : undefined}
                    className={`w-2 rounded-full transition-all ${
                      isRealPage
                        ? i === currentPage
                          ? 'h-6 bg-amber-600'
                          : 'h-2 bg-gray-300 hover:bg-gray-400 cursor-pointer'
                        : 'h-2 bg-gray-200 cursor-default'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFeed;
