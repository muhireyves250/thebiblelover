import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import AutoText from '../../components/AutoText';
import { BIBLE_BOOKS } from '../../data/bibleBooks';
import { useBibleOffline } from '../../hooks/useBibleOffline';

type Result = { book: number; chapter: number; verse: number; text: string };

const SEARCH_DEBOUNCE_MS = 300;
const MAX_RESULTS = 100;

const BibleSearch: React.FC = () => {
  const { lang, searchVerses, getDownloadStatus } = useBibleOffline();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [stillDownloading, setStillDownloading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const latestQueryRef = useRef('');

  useEffect(() => {
    getDownloadStatus(lang).then((status) => setStillDownloading(!status.complete));
  }, [lang, getDownloadStatus]);

  const runSearch = (value: string) => {
    setQuery(value);
    latestQueryRef.current = value;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setTotalMatches(0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const matches = await searchVerses(lang, value);
      if (latestQueryRef.current !== value) return; // a newer search started while this one ran
      setResults(matches.slice(0, MAX_RESULTS));
      setTotalMatches(matches.length);
    }, SEARCH_DEBOUNCE_MS);
  };

  // Supports Google's Sitelinks Search Box (see the WebSite/SearchAction
  // structured data in index.html), and lets anyone deep-link a search.
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SEO
        title="Shakisha muri Bibiliya · Search the Bible · Rechercher dans la Bible"
        description="Shakisha muri Bibiliya Yera — Search the whole Bible — Recherchez dans toute la Bible. Mu Kinyarwanda, mu Cyongereza, no mu Gifaransa."
      />
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

        {totalMatches > MAX_RESULTS && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Showing the first {MAX_RESULTS} of {totalMatches} matches — narrow your search to see more.
          </p>
        )}

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
