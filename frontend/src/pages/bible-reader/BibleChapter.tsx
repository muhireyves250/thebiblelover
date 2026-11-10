import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import AutoText from '../../components/AutoText';
import { ChevronDown } from 'lucide-react';
import { BIBLE_BOOKS } from '../../data/bibleBooks';
import { useBibleOffline } from '../../hooks/useBibleOffline';
import type { Lang } from '../../lib/bibleOfflineDb';
import { detectSwipe } from '../../lib/swipeGesture';
import ChapterPickerOverlay from './ChapterPickerOverlay';
import BibleSidebar from './BibleSidebar';
import VerseActionToolbar from './VerseActionToolbar';
import NoteSheet from './NoteSheet';

type ChapterParams = { lang: Lang; book: string; chapter: string };

const BibleChapter: React.FC = () => {
  const { lang, book: bookParam, chapter: chapterParam } = useParams<ChapterParams>();
  const book = Number(bookParam);
  const chapter = Number(chapterParam);
  const navigate = useNavigate();

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

  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const bookMeta = BIBLE_BOOKS.find((b) => b.number === book);

  useEffect(() => {
    if (!lang || !book || !chapter) return;
    setVerses(null);
    setOfflineMiss(false);
    setSelectedVerse(null);

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

  const shareVerse = async (verseNumber: number) => {
    const text = verses?.[verseNumber - 1] ?? '';
    const reference = `${bookMeta?.names[lang!]} ${chapter}:${verseNumber}`;
    const url = `${window.location.origin}/bible/${lang}/${book}/${chapter}`;
    if (navigator.share) {
      await navigator.share({ text: `${reference} — "${text}"`, url });
    } else {
      await navigator.clipboard.writeText(`${reference} — "${text}" ${url}`);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = bookMeta && chapter < bookMeta.chapterCount ? chapter + 1 : null;

  const title = useMemo(
    () => (bookMeta && lang ? `${bookMeta.names[lang]} ${chapter}` : 'Bible'),
    [bookMeta, lang, chapter]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevChapter) navigate(`/bible/${lang}/${book}/${prevChapter}`);
      if (e.key === 'ArrowRight' && nextChapter) navigate(`/bible/${lang}/${book}/${nextChapter}`);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lang, book, prevChapter, nextChapter, navigate]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const direction = detectSwipe(
      touchStart.current.x, e.changedTouches[0].clientX,
      touchStart.current.y, e.changedTouches[0].clientY
    );
    if (direction === 'left' && nextChapter) navigate(`/bible/${lang}/${book}/${nextChapter}`);
    if (direction === 'right' && prevChapter) navigate(`/bible/${lang}/${book}/${prevChapter}`);
    touchStart.current = null;
  };

  return (
    <>
      <SEO title={title} description={`Read ${title} offline.`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16 flex gap-8">
        <div className="hidden md:block">
          {lang && <BibleSidebar lang={lang} currentBook={book} currentChapter={chapter} />}
        </div>

        <div className="max-w-3xl mx-auto md:mx-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <button onClick={() => navigate('/bible')} className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline">
              &larr; All books
            </button>
            <button onClick={() => setPickerOpen(true)} className="flex items-center gap-1">
              <AutoText as="h1" className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{title}</AutoText>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
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
            <div className="space-y-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              {verses.map((text, index) => {
                const verseNumber = index + 1;
                const color = highlighted.get(verseNumber);
                const isSelected = selectedVerse === verseNumber;
                return (
                  <p
                    key={verseNumber}
                    onClick={() => setSelectedVerse(isSelected ? null : verseNumber)}
                    className={`p-2 rounded-lg cursor-pointer text-sm md:text-base text-gray-800 dark:text-gray-200 leading-7 font-sans transition-all ${
                      color ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                    } ${isSelected ? 'ring-2 ring-amber-400/60' : ''}`}
                  >
                    <sup className="text-amber-700 font-bold mr-1">{verseNumber}</sup>
                    {text}
                  </p>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            {prevChapter ? (
              <button onClick={() => navigate(`/bible/${lang}/${book}/${prevChapter}`)} className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline">
                &larr; Chapter {prevChapter}
              </button>
            ) : <span />}
            {nextChapter ? (
              <button onClick={() => navigate(`/bible/${lang}/${book}/${nextChapter}`)} className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline">
                Chapter {nextChapter} &rarr;
              </button>
            ) : <span />}
          </div>
        </div>
      </div>

      {lang && <ChapterPickerOverlay lang={lang} isOpen={pickerOpen} onClose={() => setPickerOpen(false)} />}

      {selectedVerse !== null && !noteSheetOpen && (
        <VerseActionToolbar
          isBookmarked={bookmarked.has(selectedVerse)}
          isHighlighted={highlighted.has(selectedVerse)}
          onBookmark={() => toggleBookmark(selectedVerse)}
          onHighlight={() => toggleHighlight(selectedVerse)}
          onNote={() => setNoteSheetOpen(true)}
          onShare={() => shareVerse(selectedVerse)}
          onClose={() => setSelectedVerse(null)}
        />
      )}

      {selectedVerse !== null && (
        <NoteSheet
          isOpen={noteSheetOpen}
          initialText={notes.get(selectedVerse) ?? ''}
          onSave={(text) => saveNote(selectedVerse, text)}
          onDelete={() => saveNote(selectedVerse, '')}
          onClose={() => setNoteSheetOpen(false)}
        />
      )}

      {copiedToast && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center">
          <div className="bg-[#111113] text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">Copied to clipboard</div>
        </div>
      )}
    </>
  );
};

export default BibleChapter;
