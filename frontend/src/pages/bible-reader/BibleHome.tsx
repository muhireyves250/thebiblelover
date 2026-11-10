import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import AutoText from '../../components/AutoText';
import { BIBLE_BOOKS } from '../../data/bibleBooks';
import { useBibleOffline } from '../../hooks/useBibleOffline';
import type { Lang } from '../../lib/bibleOfflineDb';

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'rw', label: 'Kinyarwanda' },
];

const BibleHome: React.FC = () => {
  const { lang, setLang, getReadingPosition } = useBibleOffline();
  const [resume, setResume] = useState<{ lang: Lang; book: number; chapter: number } | null>(null);

  useEffect(() => {
    getReadingPosition().then((position) => {
      if (position) setResume(position);
    });
  }, [getReadingPosition]);

  const oldTestament = BIBLE_BOOKS.filter((b) => b.testament === 'OT');
  const newTestament = BIBLE_BOOKS.filter((b) => b.testament === 'NT');

  return (
    <>
      <SEO title="Bible" description="Read the whole Bible offline in Kinyarwanda, English, or French." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16">
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-4 bg-amber-700 rounded-sm" />
            <AutoText as="span" className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Bible</AutoText>
          </div>
          <AutoText as="h1" className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Read the Bible</AutoText>
          <AutoText as="p" className="text-sm text-gray-500 dark:text-gray-400 mt-2">Available offline, in three languages.</AutoText>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 mb-6 md:mb-8">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border transition-colors ${
                  lang === l.code
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white dark:bg-[#141417] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link to="/bible/search" className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline">
            Search
          </Link>
        </div>

        {resume && (
          <Link
            to={`/bible/${resume.lang}/${resume.book}/${resume.chapter}`}
            className="block mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30"
          >
            <AutoText as="span" className="text-xs font-bold uppercase tracking-widest text-amber-700">Continue reading</AutoText>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {BIBLE_BOOKS.find((b) => b.number === resume.book)?.names[resume.lang]} {resume.chapter}
            </p>
          </Link>
        )}

        <AutoText as="h2" className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">Old Testament</AutoText>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-8">
          {oldTestament.map((book) => (
            <Link
              key={book.number}
              to={`/bible/${lang}/${book.number}/1`}
              className="px-2.5 py-2 rounded-md bg-white dark:bg-[#141417] border border-gray-200 dark:border-white/10 text-xs md:text-sm leading-tight text-gray-700 dark:text-gray-300 hover:border-amber-400 transition-colors"
            >
              {book.names[lang]}
            </Link>
          ))}
        </div>

        <AutoText as="h2" className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">New Testament</AutoText>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {newTestament.map((book) => (
            <Link
              key={book.number}
              to={`/bible/${lang}/${book.number}/1`}
              className="px-2.5 py-2 rounded-md bg-white dark:bg-[#141417] border border-gray-200 dark:border-white/10 text-xs md:text-sm leading-tight text-gray-700 dark:text-gray-300 hover:border-amber-400 transition-colors"
            >
              {book.names[lang]}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default BibleHome;
