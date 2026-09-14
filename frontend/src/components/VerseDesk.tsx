import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Share2 } from 'lucide-react';
import { useVerseArchive, type VerseArchiveItem } from '../hooks/useVerseArchive';
import { useBibleVerse } from '../hooks/useBibleVerse';
import ShareModal from './ShareModal';
import AutoText from './AutoText';

const DAY_TABS: { label: string; day: number | null }[] = [
  { label: 'All', day: null },
  { label: 'Mon', day: 1 },
  { label: 'Tue', day: 2 },
  { label: 'Wed', day: 3 },
  { label: 'Thu', day: 4 },
  { label: 'Fri', day: 5 },
  { label: 'Sat', day: 6 },
  { label: 'Sun', day: 0 }
];

// displayDate is stored as a UTC-midnight "date only" value — reading it back
// with local-time getters can shift it to the previous/next calendar day
// depending on the viewer's timezone, so every read here pins to UTC.
const formatDate = (dateString?: string) =>
  dateString
    ? new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : '';

const dayAbbrev = (dateString?: string) =>
  dateString ? new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase() : 'VERSE';

const getUtcDay = (dateString?: string) =>
  dateString ? new Date(dateString).getUTCDay() : null;

const CategoryTag: React.FC<{ item: VerseArchiveItem }> = ({ item }) => (
  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-2">
    <span className="text-amber-700">{dayAbbrev(item.displayDate)}</span>
    <span className="text-gray-300">·</span>
    <span className="text-gray-400 dark:text-gray-500">{item.translation}</span>
  </div>
);

const MetaRow: React.FC<{ item: VerseArchiveItem }> = ({ item }) => (
  <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-white/5">
    <span className="text-[11px] text-gray-400 dark:text-gray-500">{formatDate(item.displayDate)}</span>
    <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
      <Share2 className="w-3 h-3" /> {item.shareCount}
    </span>
  </div>
);

const FeaturedVerseCard: React.FC<{ item: VerseArchiveItem; onShare: () => void }> = ({ item, onShare }) => (
  <div className="h-full flex flex-col sm:flex-row bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
    <Link to={`/verses/${item.id}`} className="relative w-full sm:w-[45%] shrink-0 min-h-[220px] bg-gray-100 dark:bg-white/10 overflow-hidden block">
      <img
        src={item.image || '/images/about.png'}
        alt={item.reference}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider rounded">
        {dayAbbrev(item.displayDate)}
      </span>
    </Link>
    <div className="relative flex-1 p-4 md:p-6 flex flex-col justify-center border-t sm:border-t-0 sm:border-l-4 border-amber-700">
      <CategoryTag item={item} />
      <Link to={`/verses/${item.id}`}>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white uppercase leading-snug mb-3 line-clamp-4 hover:text-amber-700 transition-colors">
          "{item.text}"
        </h3>
      </Link>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {item.reference} ({item.translation})
      </p>
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">{formatDate(item.displayDate)}</span>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors"
        >
          <Share2 className="w-3 h-3" /> Share
        </button>
      </div>
    </div>
  </div>
);

const VerseCard: React.FC<{ item: VerseArchiveItem }> = ({ item }) => (
  <Link to={`/verses/${item.id}`} className="flex flex-1 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm hover:border-gray-400 hover:shadow-md transition-all">
    <div className="relative w-28 sm:w-36 shrink-0 bg-gray-100 dark:bg-white/10 overflow-hidden">
      <img
        src={item.image || '/images/about.png'}
        alt={item.reference}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="flex-1 p-4 min-w-0">
      <CategoryTag item={item} />
      <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase leading-snug line-clamp-2 mb-1 hover:text-amber-700 transition-colors">
        "{item.text}"
      </h4>
      <p className="text-xs text-gray-400 dark:text-gray-500">{item.reference}</p>
      <MetaRow item={item} />
    </div>
  </Link>
);

const VerseCardSkeleton: React.FC = () => (
  <div className="flex flex-1 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
    <div className="w-28 sm:w-36 shrink-0 bg-gray-300 dark:bg-white/10 animate-pulse" />
    <div className="flex-1 p-4">
      <div className="h-3 w-16 bg-gray-300 dark:bg-white/10 rounded animate-pulse mb-3" />
      <div className="h-4 w-full bg-gray-300 dark:bg-white/10 rounded animate-pulse mb-2" />
      <div className="h-4 w-2/3 bg-gray-300 dark:bg-white/10 rounded animate-pulse mb-4" />
      <div className="h-3 w-1/2 bg-gray-300 dark:bg-white/10 rounded animate-pulse" />
    </div>
  </div>
);

const NoVersesYet: React.FC = () => (
  <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center bg-white dark:bg-[#141417] rounded-lg border border-dashed border-gray-300 dark:border-white/10 px-8">
    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">No verses for this day</p>
    <p className="text-xs text-gray-400 dark:text-gray-500">Try another day, or check "All".</p>
  </div>
);

const VerseDesk: React.FC = () => {
  const { featured, items, hasLoaded } = useVerseArchive(13);
  const { shareVerse } = useBibleVerse();
  const [activeDay, setActiveDay] = useState<number | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // `featured` is the single latest verse overall and `items` the rest, in
  // the same descending order — flatten them back into one timeline so a
  // day filter can pick out that day's own most-recent verse for the big
  // slot, not just filter the smaller side list. The seed data has exact
  // duplicate rows for several dates, so dedupe by displayDate too —
  // otherwise "today"'s verse could reappear as one of the "other two".
  const allVerses = useMemo(() => {
    const combined = featured ? [featured, ...items] : items;
    const seenDates = new Set<string>();
    return combined.filter(v => {
      const key = v.displayDate || v.id;
      if (seenDates.has(key)) return false;
      seenDates.add(key);
      return true;
    });
  }, [featured, items]);

  // The day filter only changes which verse is featured — it picks that
  // day's own latest verse for the big slot. The side list is intentionally
  // NOT re-filtered by day: with a small archive, filtering both to the same
  // day usually leaves the list empty. Instead it always shows the 2 most
  // recent verses overall, excluding whichever one is currently featured.
  const filteredVerses = useMemo(() => {
    if (activeDay === null) return allVerses;
    return allVerses.filter(v => getUtcDay(v.displayDate) === activeDay);
  }, [allVerses, activeDay]);

  const displayedFeatured = filteredVerses[0] || null;
  const displayedList = useMemo(
    () => allVerses.filter(v => v.id !== displayedFeatured?.id).slice(0, 2),
    [allVerses, displayedFeatured]
  );

  const handleShare = () => {
    if (!displayedFeatured) return;
    shareVerse(displayedFeatured.id, 'COPY_LINK').catch(() => {});
    setIsShareModalOpen(true);
  };

  if (hasLoaded && !featured && items.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-20 bg-white dark:bg-transparent isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 md:gap-6 mb-4 md:mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <span className="w-1 h-4 bg-amber-700 rounded-sm" />
              <AutoText as="span" className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-700">Verse Desk</AutoText>
            </div>
            <AutoText as="h2" className="text-xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Verse of the Day</AutoText>
            <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mt-2">Daily encouragement · Scripture · Faith &amp; reflection</p>
          </div>
          <Link
            to="/verses"
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 border border-gray-300 dark:border-white/10 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shrink-0"
          >
            All Verses <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </Link>
        </div>

        {/* Mobile: just today's featured verse, no filter/list */}
        <div className="md:hidden">
          {!hasLoaded ? (
            <div className="h-full flex flex-col sm:flex-row bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
              <div className="w-full min-h-[160px] bg-gray-300 dark:bg-white/10 animate-pulse" />
              <div className="flex-1 p-4">
                <div className="h-3 w-20 bg-gray-300 dark:bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ) : featured ? (
            <FeaturedVerseCard item={featured} onShare={handleShare} />
          ) : (
            <NoVersesYet />
          )}
        </div>

        <div className="hidden md:block border-t border-gray-200 dark:border-white/10 mb-5" />

        {/* Filter bar - desktop only */}
        <div className="hidden md:flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mr-1">Filter</span>
            {DAY_TABS.map(tab => (
              <button
                key={tab.label}
                onClick={() => setActiveDay(tab.day)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition-colors ${
                  activeDay === tab.day
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white dark:bg-[#141417] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
            {filteredVerses.length} Verses
          </span>
        </div>

        <div className="hidden md:block border-t border-gray-200 dark:border-white/10 mb-8" />

        {/* Featured + list - desktop only */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3">
            {!hasLoaded ? (
              <div className="h-full flex flex-col sm:flex-row bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
                <div className="w-full sm:w-[45%] min-h-[220px] bg-gray-300 dark:bg-white/10 animate-pulse" />
                <div className="flex-1 p-6">
                  <div className="h-3 w-20 bg-gray-300 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ) : displayedFeatured ? (
              <FeaturedVerseCard item={displayedFeatured} onShare={handleShare} />
            ) : (
              <NoVersesYet />
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {!hasLoaded ? (
              [1, 2].map(i => <VerseCardSkeleton key={i} />)
            ) : displayedList.length === 0 ? (
              <NoVersesYet />
            ) : (
              displayedList.map(item => <VerseCard key={item.id} item={item} />)
            )}
          </div>
        </div>
      </div>

      {displayedFeatured && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={displayedFeatured.reference}
          url={`${window.location.origin}/verses/${displayedFeatured.id}`}
          excerpt={displayedFeatured.text}
          heading="Share This Verse"
        />
      )}
    </section>
  );
};

export default VerseDesk;
