import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVerseArchive, type VerseArchiveItem } from '../hooks/useVerseArchive';
import SEO from '../components/SEO';

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

const formatDate = (dateString?: string) =>
  dateString
    ? new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : '';

const dayAbbrev = (dateString?: string) =>
  dateString ? new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase() : 'VERSE';

const getUtcDay = (dateString?: string) =>
  dateString ? new Date(dateString).getUTCDay() : null;

const VerseCard: React.FC<{ item: VerseArchiveItem }> = ({ item }) => (
  <Link to={`/verses/${item.id}`} className="block bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:border-gray-400 hover:shadow-md transition-all">
    <div className="relative h-36 bg-gray-100 overflow-hidden">
      <img src={item.image || '/images/about.png'} alt={item.reference} className="w-full h-full object-cover" loading="lazy" />
      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider rounded">
        {dayAbbrev(item.displayDate)}
      </span>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-2">
        <span className="text-amber-700">{dayAbbrev(item.displayDate)}</span>
        <span className="text-gray-300">&middot;</span>
        <span className="text-gray-400">{item.translation}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-900 uppercase leading-snug line-clamp-3 mb-1">
        "{item.text}"
      </h3>
      <p className="text-xs text-gray-400">{item.reference}</p>
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">{formatDate(item.displayDate)}</span>
        <span className="text-[11px] text-gray-400">{item.shareCount} shares</span>
      </div>
    </div>
  </Link>
);

const VerseCardSkeleton: React.FC = () => (
  <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
    <div className="h-36 bg-gray-300 animate-pulse" />
    <div className="p-4">
      <div className="h-3 w-16 bg-gray-300 rounded animate-pulse mb-3" />
      <div className="h-4 w-full bg-gray-300 rounded animate-pulse mb-2" />
      <div className="h-4 w-2/3 bg-gray-300 rounded animate-pulse mb-4" />
      <div className="h-3 w-1/2 bg-gray-300 rounded animate-pulse" />
    </div>
  </div>
);

const Verses: React.FC = () => {
  const { featured, items, hasLoaded } = useVerseArchive(50);
  const [activeDay, setActiveDay] = useState<number | null>(null);

  // Same de-dupe-by-day approach as VerseDesk — the archive has exact
  // duplicate rows for several dates, and `featured` overlaps `items`.
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

  const filteredVerses = useMemo(() => {
    if (activeDay === null) return allVerses;
    return allVerses.filter(v => getUtcDay(v.displayDate) === activeDay);
  }, [allVerses, activeDay]);

  return (
    <>
      <SEO title="All Verses" description="Browse every verse of the day from our archive." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-6">All Verses</h1>

        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mr-1">Filter</span>
            {DAY_TABS.map(tab => (
              <button
                key={tab.label}
                onClick={() => setActiveDay(tab.day)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition-colors ${
                  activeDay === tab.day
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
            {filteredVerses.length} Verses
          </span>
        </div>

        {!hasLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <VerseCardSkeleton key={i} />)}
          </div>
        ) : filteredVerses.length === 0 ? (
          <p className="text-gray-500">No verses found for this day.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVerses.map(item => (
              <VerseCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Verses;
