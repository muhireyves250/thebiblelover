import { openDB, type IDBPDatabase } from 'idb';
import { BIBLE_BOOKS } from '../data/bibleBooks';

export type Lang = 'rw' | 'en' | 'fr';

type ChapterResult = { verses: string[]; source: 'cache' | 'network' } | { error: 'offline-miss' };

type DownloadStatus = { booksComplete: number[]; complete: boolean };

type PersonalRecordKind = 'bookmark' | 'highlight' | 'note';

type BookmarkRecord = { key: string; lang: Lang; book: number; chapter: number; verse: number; synced: boolean };
type HighlightRecord = BookmarkRecord & { color: string };
type NoteRecord = BookmarkRecord & { text: string };
type PositionRecord = { lang: Lang; book: number; chapter: number; synced: boolean };

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB('bible-offline', 1, {
      upgrade(db) {
        db.createObjectStore('verses');
        db.createObjectStore('downloadStatus');
        db.createObjectStore('bookmarks');
        db.createObjectStore('highlights');
        db.createObjectStore('notes');
        db.createObjectStore('readingPosition');
      },
    });
  }
  return dbPromise;
}

const chapterKey = (lang: Lang, book: number, chapter: number) => `${lang}-${book}-${chapter}`;
const verseKey = (lang: Lang, book: number, chapter: number, verse: number) => `${lang}-${book}-${chapter}-${verse}`;

async function fetchAndCacheBook(lang: Lang, book: number): Promise<string[][] | null> {
  let response: { ok: boolean; json?: () => Promise<string[][]> };
  try {
    response = await fetch(`/bible-data/${lang}/${book}.json`);
  } catch {
    return null;
  }
  if (!response.ok || !response.json) return null;

  const chapters = await response.json();
  const db = await getDb();
  const tx = db.transaction('verses', 'readwrite');
  chapters.forEach((verses, index) => {
    tx.store.put(verses, chapterKey(lang, book, index + 1));
  });
  await tx.done;
  return chapters;
}

export async function getChapter(lang: Lang, book: number, chapter: number): Promise<ChapterResult> {
  const db = await getDb();
  const cached = await db.get('verses', chapterKey(lang, book, chapter));
  if (cached) {
    return { verses: cached, source: 'cache' };
  }

  const chapters = await fetchAndCacheBook(lang, book);
  if (!chapters) {
    const recheck = await db.get('verses', chapterKey(lang, book, chapter));
    if (recheck) return { verses: recheck, source: 'cache' };
    return { error: 'offline-miss' };
  }

  return { verses: chapters[chapter - 1], source: 'network' };
}

const fillingLanguages = new Set<Lang>();

export function startBackgroundFill(lang: Lang, onProgress?: (booksComplete: number) => void): void {
  if (fillingLanguages.has(lang)) return;
  fillingLanguages.add(lang);

  (async () => {
    try {
      const db = await getDb();
      for (const book of BIBLE_BOOKS) {
        const status: DownloadStatus = (await db.get('downloadStatus', lang)) ?? { booksComplete: [], complete: false };
        if (status.booksComplete.includes(book.number)) continue;

        const chapters = await fetchAndCacheBook(lang, book.number);
        if (!chapters) continue;

        const updated: DownloadStatus = {
          booksComplete: [...status.booksComplete, book.number],
          complete: false,
        };
        updated.complete = updated.booksComplete.length === BIBLE_BOOKS.length;
        await db.put('downloadStatus', updated, lang);
        onProgress?.(updated.booksComplete.length);
      }
    } finally {
      fillingLanguages.delete(lang);
    }
  })();
}

export async function getDownloadStatus(lang: Lang): Promise<DownloadStatus> {
  const db = await getDb();
  return (await db.get('downloadStatus', lang)) ?? { booksComplete: [], complete: false };
}

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export async function searchVerses(lang: Lang, query: string) {
  const db = await getDb();
  const keys = (await db.getAllKeys('verses')) as string[];
  const normalizedQuery = normalize(query);
  const results: Array<{ book: number; chapter: number; verse: number; text: string }> = [];

  for (const key of keys) {
    const [keyLang, bookStr, chapterStr] = key.split('-');
    if (keyLang !== lang) continue;
    const verses: string[] = await db.get('verses', key);
    verses.forEach((text, index) => {
      if (normalize(text).includes(normalizedQuery)) {
        results.push({ book: Number(bookStr), chapter: Number(chapterStr), verse: index + 1, text });
      }
    });
  }

  return results;
}

async function getRecords<T extends { synced: boolean }>(store: string): Promise<T[]> {
  const db = await getDb();
  return (await db.getAll(store)) as T[];
}

export async function getBookmarks() {
  return getRecords<BookmarkRecord>('bookmarks');
}
export async function setBookmark(lang: Lang, book: number, chapter: number, verse: number) {
  const db = await getDb();
  const key = verseKey(lang, book, chapter, verse);
  await db.put('bookmarks', { key, lang, book, chapter, verse, synced: false }, key);
}
export async function deleteBookmark(lang: Lang, book: number, chapter: number, verse: number) {
  const db = await getDb();
  await db.delete('bookmarks', verseKey(lang, book, chapter, verse));
}

export async function getHighlights() {
  return getRecords<HighlightRecord>('highlights');
}
export async function setHighlight(lang: Lang, book: number, chapter: number, verse: number, color: string) {
  const db = await getDb();
  const key = verseKey(lang, book, chapter, verse);
  await db.put('highlights', { key, lang, book, chapter, verse, color, synced: false }, key);
}
export async function deleteHighlight(lang: Lang, book: number, chapter: number, verse: number) {
  const db = await getDb();
  await db.delete('highlights', verseKey(lang, book, chapter, verse));
}

export async function getNotes() {
  return getRecords<NoteRecord>('notes');
}
export async function setNote(lang: Lang, book: number, chapter: number, verse: number, text: string) {
  const db = await getDb();
  const key = verseKey(lang, book, chapter, verse);
  await db.put('notes', { key, lang, book, chapter, verse, text, synced: false }, key);
}
export async function deleteNote(lang: Lang, book: number, chapter: number, verse: number) {
  const db = await getDb();
  await db.delete('notes', verseKey(lang, book, chapter, verse));
}

const READING_POSITION_KEY = 'current';

export async function getReadingPosition(): Promise<PositionRecord | undefined> {
  const db = await getDb();
  return db.get('readingPosition', READING_POSITION_KEY);
}
export async function setReadingPosition(lang: Lang, book: number, chapter: number) {
  const db = await getDb();
  await db.put('readingPosition', { lang, book, chapter, synced: false }, READING_POSITION_KEY);
}

export async function getUnsyncedRecords() {
  const [bookmarks, highlights, notes, position] = await Promise.all([
    getBookmarks(),
    getHighlights(),
    getNotes(),
    getReadingPosition(),
  ]);
  return {
    bookmarks: bookmarks.filter((r) => !r.synced),
    highlights: highlights.filter((r) => !r.synced),
    notes: notes.filter((r) => !r.synced),
    position: position && !position.synced ? position : null,
  };
}

const STORE_BY_KIND: Record<PersonalRecordKind, string> = {
  bookmark: 'bookmarks',
  highlight: 'highlights',
  note: 'notes',
};

export async function markSynced(kind: PersonalRecordKind | 'position', key: string) {
  const db = await getDb();
  if (kind === 'position') {
    const record = await db.get('readingPosition', READING_POSITION_KEY);
    if (record) await db.put('readingPosition', { ...record, synced: true }, READING_POSITION_KEY);
    return;
  }
  const store = STORE_BY_KIND[kind];
  const record = await db.get(store, key);
  if (record) await db.put(store, { ...record, synced: true }, key);
}
