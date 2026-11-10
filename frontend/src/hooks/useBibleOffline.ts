import { useCallback, useEffect, useState } from 'react';
import * as db from '../lib/bibleOfflineDb';
import type { Lang } from '../lib/bibleOfflineDb';
import { syncBibleReadingData } from '../lib/bibleSync';

const LANG_STORAGE_KEY = 'bibleLang';

export function useBibleOffline() {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem(LANG_STORAGE_KEY) as Lang) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // ignore (e.g. storage disabled)
    }
  }, []);

  useEffect(() => {
    db.startBackgroundFill(lang);
  }, [lang]);

  useEffect(() => {
    syncBibleReadingData();
    window.addEventListener('online', syncBibleReadingData);
    return () => window.removeEventListener('online', syncBibleReadingData);
  }, []);

  return {
    lang,
    setLang,
    getChapter: db.getChapter,
    getDownloadStatus: db.getDownloadStatus,
    searchVerses: db.searchVerses,
    getBookmarks: db.getBookmarks,
    setBookmark: db.setBookmark,
    deleteBookmark: db.deleteBookmark,
    getHighlights: db.getHighlights,
    setHighlight: db.setHighlight,
    deleteHighlight: db.deleteHighlight,
    getNotes: db.getNotes,
    setNote: db.setNote,
    deleteNote: db.deleteNote,
    getReadingPosition: db.getReadingPosition,
    setReadingPosition: db.setReadingPosition,
  };
}
