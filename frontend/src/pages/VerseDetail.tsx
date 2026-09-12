import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bibleVersesAPI } from '../services/api';
import type { BibleVerse } from '../services/api.d';
import { useVerseArchive } from '../hooks/useVerseArchive';
import { useBibleVerse } from '../hooks/useBibleVerse';
import { useCachedFetch } from '../hooks/useAPI';
import { Calendar, BookOpen, Languages, Share2, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import BibleVerseShareModal from '../components/BibleVerseShareModal';

const reference = (v?: BibleVerse) => (v ? `${v.book} ${v.chapter}:${v.verse}` : '');

const formattedFull = (dateString?: string) =>
  dateString
    ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '';

const dayAbbrev = (dateString?: string) =>
  dateString ? new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }) : 'Verse';

const VerseDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();

  const { data, loading, error, refetch } = useCachedFetch<any>(
    id ? `verse:v1:${id}` : null,
    () => bibleVersesAPI.getVerse(id),
    { ttl: 5 * 60 * 1000 }
  );
  const verse: BibleVerse | undefined = data?.data?.verse || data?.verse;

  // Recent verses (sidebar list) — reuse the same archive the homepage
  // Verse Desk and the All Verses page pull from.
  const { featured, items, hasLoaded: recentLoaded } = useVerseArchive(13);
  const recentVerses = useMemo(() => {
    const combined = featured ? [featured, ...items] : items;
    const seen = new Set<string>();
    return combined.filter(v => {
      if (v.id === id) return false;
      const key = v.displayDate || v.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);
  }, [featured, items, id]);

  const { shareVerse } = useBibleVerse();
  const [isSharing, setIsSharing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<any>(null);

  const handleShare = async () => {
    if (!verse || isSharing) return;
    setIsSharing(true);
    try {
      const result = await shareVerse(verse.id, 'COPY_LINK');
      if (result.success && result.data) {
        setShareData(result.data);
        setIsShareModalOpen(true);
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (!verse && !loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-3">
            {error ? 'Error loading verse' : 'Verse not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find the verse you're looking for."}
          </p>
          {error && (
            <button onClick={refetch} className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800">Try again</button>
          )}
        </div>
      </div>
    );
  }

  const showSkeleton = loading || !verse;

  return (
    <div className="min-h-screen bg-white">
      {verse && (
        <SEO title={reference(verse)} description={verse.text} image={verse.image} type="article" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-10">
        <Link
          to="/verses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-amber-700 transition-colors mb-3 md:mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Verses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-10">
          {/* Main column */}
          <article className="lg:col-span-2">
            {showSkeleton ? (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 md:p-8 mb-4 md:mb-8">
                <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-4" />
                <div className="h-40 sm:h-64 md:h-80 bg-gray-300 rounded-lg animate-pulse mb-6" />
                <div className="h-9 bg-gray-300 rounded animate-pulse w-full mb-2" />
                <div className="h-9 bg-gray-300 rounded animate-pulse w-2/3 mb-4" />
                <div className="h-4 bg-gray-300 rounded animate-pulse w-1/3" />
              </div>
            ) : (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 md:p-8 mb-4 md:mb-8">
                <span className="inline-block px-2 py-0.5 md:px-2.5 md:py-1 bg-amber-700 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded mb-2 md:mb-4">
                  {dayAbbrev(verse.displayDate)} &middot; {verse.translation}
                </span>

                <div className="relative w-full h-40 sm:h-64 md:h-80 mb-4 md:mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={verse.image || '/images/about.png'}
                    alt={reference(verse)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <h1 className="text-lg md:text-3xl font-bold text-gray-900 uppercase leading-snug mb-3 md:mb-4">
                  "{verse.text}"
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 pb-4 md:pb-6 mb-2 border-b border-gray-200">
                  <p className="text-sm md:text-lg text-gray-600">
                    {reference(verse)} <span className="text-gray-400 text-xs md:text-base">({verse.translation})</span>
                  </p>

                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex items-center gap-1.5 px-3 md:px-4 py-1 md:py-1.5 bg-gray-900 text-white text-[10px] md:text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <Share2 className="w-3 h-3" /> {isSharing ? 'Sharing...' : 'Share'}
                  </button>
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4 md:space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            {/* Verse Details */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 md:p-5">
              <h3 className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-3 md:mb-4">Verse Details</h3>
              {!verse ? (
                <dl className="space-y-1">
                  {[BookOpen, Calendar, Languages, Share2].map((Icon, i) => (
                    <div key={i} className="flex items-center justify-between py-2 md:py-2.5 border-b border-gray-100 last:border-0">
                      <dt className="flex items-center gap-2 text-gray-500">
                        <Icon className="w-3.5 h-3.5 text-gray-300" />
                        <span className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                      </dt>
                      <dd className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </dl>
              ) : (
                <dl className="space-y-1">
                  {[
                    [BookOpen, 'Reference', reference(verse)],
                    [Calendar, 'Published', formattedFull(verse.displayDate)],
                    [Languages, 'Translation', verse.translation],
                    [Share2, 'Shares', verse.shareCount]
                  ].map(([Icon, label, value]: any) => (
                    <div key={label} className="flex items-center justify-between py-2 md:py-2.5 border-b border-gray-100 last:border-0">
                      <dt className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
                        <Icon className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-700" />
                        {label}
                      </dt>
                      <dd className="font-bold text-gray-900 text-xs md:text-sm">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Recent Verses */}
            {!recentLoaded && (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 md:p-5">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="h-3 w-24 bg-gray-300 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-300 rounded animate-pulse" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-start gap-2.5 md:gap-3">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-md bg-gray-300 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 w-16 bg-gray-300 rounded animate-pulse" />
                        <div className="h-3.5 bg-gray-300 rounded animate-pulse w-full" />
                        <div className="h-3.5 bg-gray-300 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentLoaded && recentVerses.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 md:p-5">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-700">Recent Verses</h3>
                  <Link to="/verses" className="text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-widest hover:text-amber-800 transition-colors">
                    All Verses &rarr;
                  </Link>
                </div>
                <div className="space-y-3 md:space-y-4">
                  {recentVerses.map((rv) => (
                    <Link key={rv.id} to={`/verses/${rv.id}`} className="flex items-start gap-2.5 md:gap-3 group">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                        <img src={rv.image || '/images/about.png'} alt={rv.reference} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">
                          {dayAbbrev(rv.displayDate)}
                        </span>
                        <p className="text-xs md:text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                          {rv.reference}
                        </p>
                        <div className="flex items-center justify-between mt-1 md:mt-1.5">
                          <span className="text-[10px] md:text-[11px] text-gray-400">
                            {formattedFull(rv.displayDate)}
                          </span>
                          <span className="text-[10px] md:text-[11px] text-gray-400">
                            {rv.shareCount || 0} shares
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

      {verse && (
        <BibleVerseShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          verse={{
            id: verse.id,
            verse: verse.text,
            reference: reference(verse),
            translation: verse.translation,
            image: verse.image
          }}
          shareData={shareData}
        />
      )}
    </div>
  );
};

export default VerseDetail;
