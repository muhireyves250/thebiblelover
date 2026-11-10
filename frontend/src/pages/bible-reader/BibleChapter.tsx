import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import AutoText from '../../components/AutoText';
import { BIBLE_BOOKS } from '../../data/bibleBooks';
import { useBibleOffline } from '../../hooks/useBibleOffline';
import type { Lang } from '../../lib/bibleOfflineDb';

type ChapterParams = { lang: Lang; book: string; chapter: string };

const BibleChapter: React.FC = () => {
  const { lang, book: bookParam, chapter: chapterParam } = useParams<ChapterParams>();
  const book = Number(bookParam);
  const chapter = Number(chapterParam);

  const {
    getChapter, setReadingPosition,
    getBookmarks, setBookmark, deleteBookmark,
    getHighlights, setHighlight, deleteHighlight,
    getNotes, setNote, deleteNote,
  } = useBibleOffline();

  const [verses, setVerses] = useState<string[] | null>(null);
  const [offlineMiss, setOfflineMiss] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [highlighted, setHighlighted] = useState<Map<number, string>>(new Map());
  const [notes, setNotesState] = useState<Map<number, string>>(new Map());

  const bookMeta = BIBLE_BOOKS.find((b) => b.number === book);

  useEffect(() => {
    if (!lang || !book || !chapter) return;
    setVerses(null);
    setOfflineMiss(false);

    getChapter(lang, book, chapter).then((result) => {
      if ('error' in result) {
        setOfflineMiss(true);
      } else {
        setVerses(result.verses);
      }
    });

    setReadingPosition(lang, book, chapter);
  }, [lang, book, chapter, getChapter, setReadingPosition]);

  useEffect(() => {
    if (!lang) return;
    getBookmarks().then((all) => {
      setBookmarked(new Set(all.filter((b) => b.lang === lang && b.book === book && b.chapter === chapter).map((b) => b.verse)));
    });
    getHighlights().then((all) => {
      setHighlighted(new Map(
        all.filter((h) => h.lang === lang && h.book === book && h.chapter === chapter).map((h) => [h.verse, h.color])
      ));
    });
    getNotes().then((all) => {
      setNotesState(new Map(
        all.filter((n) => n.lang === lang && n.book === book && n.chapter === chapter).map((n) => [n.verse, n.text])
      ));
    });
  }, [lang, book, chapter, getBookmarks, getHighlights, getNotes]);

  const toggleBookmark = (verse: number) => {
    if (!lang) return;
    if (bookmarked.has(verse)) {
      deleteBookmark(lang, book, chapter, verse);
      setBookmarked((prev) => { const next = new Set(prev); next.delete(verse); return next; });
    } else {
      setBookmark(lang, book, chapter, verse);
      setBookmarked((prev) => new Set(prev).add(verse));
    }
  };

  const toggleHighlight = (verse: number) => {
    if (!lang) return;
    if (highlighted.has(verse)) {
      deleteHighlight(lang, book, chapter, verse);
      setHighlighted((prev) => { const next = new Map(prev); next.delete(verse); return next; });
    } else {
      setHighlight(lang, book, chapter, verse, 'yellow');
      setHighlighted((prev) => new Map(prev).set(verse, 'yellow'));
    }
  };

  const saveNote = (verse: number, text: string) => {
    if (!lang) return;
    const current = notes.get(verse) ?? '';
    if (text === current) return; // untouched (or not yet loaded) - never overwrite with a no-op

    if (text === '') {
      deleteNote(lang, book, chapter, verse);
      setNotesState((prev) => { const next = new Map(prev); next.delete(verse); return next; });
    } else {
      setNote(lang, book, chapter, verse, text);
      setNotesState((prev) => new Map(prev).set(verse, text));
    }
  };

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = bookMeta && chapter < bookMeta.chapterCount ? chapter + 1 : null;

  const title = useMemo(
    () => (bookMeta && lang ? `${bookMeta.names[lang]} ${chapter}` : 'Bible'),
    [bookMeta, lang, chapter]
  );

  return (
    <>
      <SEO title={title} description={`Read ${title} offline.`} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/bible" className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline">
            &larr; All books
          </Link>
          <AutoText as="h1" className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{title}</AutoText>
        </div>

        {offlineMiss && (
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 text-sm text-gray-600 dark:text-gray-400">
            This chapter isn't available offline yet. Connect once to download it.
          </div>
        )}

        {!offlineMiss && !verses && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            ))}
          </div>
        )}

        {verses && (
          <div className="space-y-3">
            {verses.map((text, index) => {
              const verseNumber = index + 1;
              const color = highlighted.get(verseNumber);
              return (
                <div
                  key={verseNumber}
                  className={`p-2 rounded ${color ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''}`}
                >
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                    <sup className="text-amber-700 font-bold mr-1">{verseNumber}</sup>
                    {text}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => toggleBookmark(verseNumber)}
                      className={`text-[11px] font-bold uppercase tracking-wider ${bookmarked.has(verseNumber) ? 'text-amber-700' : 'text-gray-400'}`}
                    >
                      Bookmark
                    </button>
                    <button
                      onClick={() => toggleHighlight(verseNumber)}
                      className={`text-[11px] font-bold uppercase tracking-wider ${color ? 'text-amber-700' : 'text-gray-400'}`}
                    >
                      Highlight
                    </button>
                    <input
                      type="text"
                      placeholder="Add a note"
                      // Keyed on the loaded value so that once the async getNotes()
                      // load resolves after this input has already mounted, React
                      // remounts it with the real defaultValue instead of silently
                      // keeping an empty uncontrolled input a blur would then save
                      // over the real note.
                      key={notes.get(verseNumber) ?? ''}
                      defaultValue={notes.get(verseNumber) ?? ''}
                      onBlur={(e) => saveNote(verseNumber, e.target.value)}
                      className="text-[11px] flex-1 bg-transparent border-b border-gray-200 dark:border-white/10 focus:outline-none text-gray-500 dark:text-gray-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          {prevChapter ? (
            <Link to={`/bible/${lang}/${book}/${prevChapter}`} className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline">
              &larr; Chapter {prevChapter}
            </Link>
          ) : <span />}
          {nextChapter ? (
            <Link to={`/bible/${lang}/${book}/${nextChapter}`} className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline">
              Chapter {nextChapter} &rarr;
            </Link>
          ) : <span />}
        </div>
      </div>
    </>
  );
};

export default BibleChapter;
