import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SEO, { CANONICAL_ORIGIN } from '../../components/SEO';
import AutoText from '../../components/AutoText';
import Toast from '../../components/Toast';
import { ChevronDown } from 'lucide-react';
import { BIBLE_BOOKS } from '../../data/bibleBooks';
import { useBibleOffline } from '../../hooks/useBibleOffline';
import { useToast } from '../../hooks/useToast';
import type { Lang } from '../../lib/bibleOfflineDb';
import { detectSwipe } from '../../lib/swipeGesture';
import { shareOrCopy } from '../../lib/share';
import { bibleChapterSeoDescription } from '../../lib/bibleChapterSeo';
import ChapterPickerOverlay from './ChapterPickerOverlay';
import BibleSidebar from './BibleSidebar';
import VerseActionToolbar from './VerseActionToolbar';
import NoteSheet from './NoteSheet';

type ChapterParams = { lang: Lang; book: string; chapter: string };

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
};

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
  const { toastMessage, showToast } = useToast();

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const verseListRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const bookMeta = BIBLE_BOOKS.find((b) => b.number === book);

  useEffect(() => {
    if (!lang || !book || !chapter) return;
    setVerses(null);
    setOfflineMiss(false);
    setSelectedVerse(null);
    setNoteSheetOpen(false);

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
    const url = `${CANONICAL_ORIGIN}/bible/${lang}/${book}/${chapter}`;

    const result = await shareOrCopy({ text: `${reference} — "${text}"`, url });
    if (result === 'copied') showToast('Copied to clipboard');
    if (result === 'failed') showToast("Couldn't copy — try again");
  };

  const toggleVerseSelection = (verseNumber: number) => {
    if (noteSheetOpen) return; // editing a note - don't let other verse taps change the selection under it
    setSelectedVerse((current) => (current === verseNumber ? null : verseNumber));
  };

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = bookMeta && chapter < bookMeta.chapterCount ? chapter + 1 : null;

  const title = useMemo(
    () => (bookMeta && lang ? `${bookMeta.names[lang]} ${chapter}` : 'Bible'),
    [bookMeta, lang, chapter]
  );

  // Localized so the page actually matches a "Bibiliya"/"la Bible" search,
  // not just an English one - each language gets its own URL
  // (/bible/rw|en|fr/...), so this is a real, separately-indexable page.
  const seoDescription = useMemo(() => {
    if (!bookMeta || !lang) return undefined;
    return bibleChapterSeoDescription(lang, bookMeta.names[lang], chapter);
  }, [bookMeta, lang, chapter]);

  const alternateUrls = useMemo(() => {
    if (!bookMeta) return undefined;
    return {
      en: `/bible/en/${book}/${chapter}`,
      fr: `/bible/fr/${book}/${chapter}`,
      rw: `/bible/rw/${book}/${chapter}`,
    };
  }, [bookMeta, book, chapter]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
      if (noteSheetOpen || pickerOpen) return;

      if (e.key === 'ArrowLeft' && prevChapter) navigate(`/bible/${lang}/${book}/${prevChapter}`);
      if (e.key === 'ArrowRight' && nextChapter) navigate(`/bible/${lang}/${book}/${nextChapter}`);
      if (e.key === 'Escape' && selectedVerse !== null) setSelectedVerse(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lang, book, prevChapter, nextChapter, navigate, noteSheetOpen, pickerOpen, selectedVerse]);

  // Tapping anywhere outside the verse list or the toolbar deselects - but
  // not while the note sheet is open, so an in-progress edit never gets
  // discarded by an incidental outside tap.
  useEffect(() => {
    if (selectedVerse === null || noteSheetOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (verseListRef.current?.contains(target) || toolbarRef.current?.contains(target)) return;
      setSelectedVerse(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [selectedVerse, noteSheetOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 1) { touchStart.current = null; return; } // pinch/multi-touch - not a swipe
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    if ((window.getSelection()?.toString().length ?? 0) > 0) { touchStart.current = null; return; } // text selection, not a swipe
    const direction = detectSwipe(
      touchStart.current.x, e.changedTouches[0].clientX,
      touchStart.current.y, e.changedTouches[0].clientY
    );
    if (direction === 'left' && nextChapter) navigate(`/bible/${lang}/${book}/${nextChapter}`);
    if (direction === 'right' && prevChapter) navigate(`/bible/${lang}/${book}/${prevChapter}`);
    touchStart.current = null;
  };
  const onTouchCancel = () => { touchStart.current = null; };

  return (
    <>
      <SEO title={title} description={seoDescription} lang={lang} alternateUrls={alternateUrls} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16 flex gap-8">
        <div className="hidden md:block md:sticky md:top-4 md:self-start">
          {lang && <BibleSidebar lang={lang} currentBook={book} currentChapter={chapter} />}
        </div>

        <div className="max-w-3xl mx-auto md:mx-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/bible" className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline">
              &larr; All books
            </Link>
            <button onClick={() => setPickerOpen(true)} className="flex items-center gap-1">
              <AutoText as="span" className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{title}</AutoText>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {/* Visually hidden - keeps a real <h1> for the page's heading
              structure/SEO without nesting one inside the button above. */}
          <h1 className="sr-only">{title}</h1>

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
            <div ref={verseListRef} className="space-y-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onTouchCancel={onTouchCancel}>
              {verses.map((text, index) => {
                const verseNumber = index + 1;
                const color = highlighted.get(verseNumber);
                const isSelected = selectedVerse === verseNumber;
                return (
                  <div
                    key={verseNumber}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => toggleVerseSelection(verseNumber)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleVerseSelection(verseNumber);
                      }
                    }}
                    className={`p-2 rounded-lg cursor-pointer text-sm md:text-base text-gray-800 dark:text-gray-200 leading-7 font-sans transition-all ${
                      color ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                    } ${isSelected ? 'ring-2 ring-amber-400/60' : ''}`}
                  >
                    <sup className="text-amber-700 font-bold mr-1">{verseNumber}</sup>
                    {text}
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
      </div>

      {lang && <ChapterPickerOverlay lang={lang} isOpen={pickerOpen} onClose={() => setPickerOpen(false)} />}

      {selectedVerse !== null && !noteSheetOpen && (
        <div ref={toolbarRef}>
          <VerseActionToolbar
            isBookmarked={bookmarked.has(selectedVerse)}
            isHighlighted={highlighted.has(selectedVerse)}
            onBookmark={() => toggleBookmark(selectedVerse)}
            onHighlight={() => toggleHighlight(selectedVerse)}
            onNote={() => setNoteSheetOpen(true)}
            onShare={() => shareVerse(selectedVerse)}
            onClose={() => setSelectedVerse(null)}
          />
        </div>
      )}

      {selectedVerse !== null && (
        <NoteSheet
          key={selectedVerse}
          isOpen={noteSheetOpen}
          initialText={notes.get(selectedVerse) ?? ''}
          onSave={(text) => saveNote(selectedVerse, text)}
          onDelete={() => saveNote(selectedVerse, '')}
          onClose={() => setNoteSheetOpen(false)}
        />
      )}

      <Toast message={toastMessage} />
    </>
  );
};

export default BibleChapter;
