import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import AutoText from '../../components/AutoText';
import { BIBLE_BOOKS } from '../../data/bibleBooks';
import { useBibleOffline } from '../../hooks/useBibleOffline';

type Result = { book: number; chapter: number; verse: number; text: string };

const BibleSearch: React.FC = () => {
  const { lang, searchVerses, getDownloadStatus } = useBibleOffline();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [stillDownloading, setStillDownloading] = useState(false);

  useEffect(() => {
    getDownloadStatus(lang).then((status) => setStillDownloading(!status.complete));
  }, [lang, getDownloadStatus]);

  const runSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const matches = await searchVerses(lang, value);
    setResults(matches);
  };

  return (
    <>
      <SEO title="Search the Bible" description="Search the Bible offline." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16">
        <div className="mb-6">
          <AutoText as="h1" className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Search</AutoText>
          {stillDownloading && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Still downloading this language for offline use — results may be incomplete until it finishes.
            </p>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          placeholder="Search the Bible..."
          className="w-full px-4 py-2 rounded-md bg-white dark:bg-[#141417] border border-gray-200 dark:border-white/10 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-amber-400"
        />

        <div className="mt-6 space-y-3">
          {results.map((r) => {
            const bookMeta = BIBLE_BOOKS.find((b) => b.number === r.book);
            return (
              <Link
                key={`${r.book}-${r.chapter}-${r.verse}`}
                to={`/bible/${lang}/${r.book}/${r.chapter}`}
                className="block p-3 rounded-md bg-white dark:bg-[#141417] border border-gray-200 dark:border-white/10 hover:border-amber-400"
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-1">
                  {bookMeta?.names[lang]} {r.chapter}:{r.verse}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{r.text}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BibleSearch;
