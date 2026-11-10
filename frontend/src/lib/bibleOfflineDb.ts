import { openDB, type IDBPDatabase } from 'idb';
import { BIBLE_BOOKS } from '../data/bibleBooks';

export type Lang = 'rw' | 'en' | 'fr';

type ChapterResult = { verses: string[]; source: 'cache' | 'network' } | { error: 'offline-miss' };

type DownloadStatus = { booksComplete: number[]; complete: boolean };

type PersonalRecordKind = 'bookmark' | 'highlight' | 'note';

type BookmarkRecord = { key: string; lang: Lang; book: number; chapter: number; verse: number; synced: boolean; updatedAt: string };
type HighlightRecord = BookmarkRecord & { color: string };
type NoteRecord = BookmarkRecord & { text: string };
type PositionRecord = { lang: Lang; book: number; chapter: number; synced: boolean; updatedAt: string };
type PendingDelete = { key: string; kind: PersonalRecordKind; lang: Lang; book: number; chapter: number; verse: number };

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB('bible-offline', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('verses')) db.createObjectStore('verses');
        if (!db.objectStoreNames.contains('downloadStatus')) db.createObjectStore('downloadStatus');
        if (!db.objectStoreNames.contains('bookmarks')) db.createObjectStore('bookmarks');
        if (!db.objectStoreNames.contains('highlights')) db.createObjectStore('highlights');
        if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes');
        if (!db.objectStoreNames.contains('readingPosition')) db.createObjectStore('readingPosition');
        if (!db.objectStoreNames.contains('pendingDeletes')) db.createObjectStore('pendingDeletes');
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

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

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

// If a record being deleted was already synced to the server, the server
// doesn't know about the deletion yet - queue a tombstone so the next sync
// sends a DELETE. A record that was never synced has nothing to delete
// remotely, so it's just dropped locally.
async function deleteWithTombstone(
  store: string, kind: PersonalRecordKind, lang: Lang, book: number, chapter: number, verse: number
) {
  const db = await getDb();
  const key = verseKey(lang, book, chapter, verse);
  const existing = await db.get(store, key);
  if (existing?.synced) {
    const tombstone: PendingDelete = { key, kind, lang, book, chapter, verse };
    await db.put('pendingDeletes', tombstone, key);
  }
  await db.delete(store, key);
}

export async function getPendingDeletes(): Promise<PendingDelete[]> {
  const db = await getDb();
  return db.getAll('pendingDeletes');
}
export async function clearPendingDelete(key: string) {
  const db = await getDb();
  await db.delete('pendingDeletes', key);
}

export async function getBookmarks() {
  return getRecords<BookmarkRecord>('bookmarks');
}
export async function setBookmark(lang: Lang, book: number, chapter: number, verse: number) {
  const db = await getDb();
  const key = verseKey(lang, book, chapter, verse);
  await db.put('bookmarks', { key, lang, book, chapter, verse, synced: false, updatedAt: new Date().toISOString() }, key);
}
export async function deleteBookmark(lang: Lang, book: number, chapter: number, verse: number) {
  await deleteWithTombstone('bookmarks', 'bookmark', lang, book, chapter, verse);
}
export async function applyRemoteBookmark(remote: { lang: Lang; book: number; chapter: number; verse: number }) {
  const db = await getDb();
  const key = verseKey(remote.lang, remote.book, remote.chapter, remote.verse);
  const existing = await db.get('bookmarks', key);
  if (existing) return; // local already knows about it either way (synced, or about to be pushed)
  await db.put('bookmarks', { key, ...remote, synced: true, updatedAt: new Date().toISOString() }, key);
}

export async function getHighlights() {
  return getRecords<HighlightRecord>('highlights');
}
export async function setHighlight(lang: Lang, book: number, chapter: number, verse: number, color: string) {
  const db = await getDb();
  const key = verseKey(lang, book, chapter, verse);
  await db.put('highlights', { key, lang, book, chapter, verse, color, synced: false, updatedAt: new Date().toISOString() }, key);
}
export async function deleteHighlight(lang: Lang, book: number, chapter: number, verse: number) {
  await deleteWithTombstone('highlights', 'highlight', lang, book, chapter, verse);
}
export async function applyRemoteHighlight(remote: { lang: Lang; book: number; chapter: number; verse: number; color: string; updatedAt: string }) {
  await applyRemoteRecord('highlights', remote);
}

export async function getNotes() {
  return getRecords<NoteRecord>('notes');
}
export async function setNote(lang: Lang, book: number, chapter: number, verse: number, text: string) {
  const db = await getDb();
  const key = verseKey(lang, book, chapter, verse);
  await db.put('notes', { key, lang, book, chapter, verse, text, synced: false, updatedAt: new Date().toISOString() }, key);
}
export async function deleteNote(lang: Lang, book: number, chapter: number, verse: number) {
  await deleteWithTombstone('notes', 'note', lang, book, chapter, verse);
}
export async function applyRemoteNote(remote: { lang: Lang; book: number; chapter: number; verse: number; text: string; updatedAt: string }) {
  await applyRemoteRecord('notes', remote);
}

// Shared last-write-wins merge for stores keyed by lang/book/chapter/verse
// with an `updatedAt`: the newer side wins outright. A record that doesn't
// exist locally yet is simply adopted from the server.
async function applyRemoteRecord(
  store: string,
  remote: { lang: Lang; book: number; chapter: number; verse: number; updatedAt: string } & Record<string, unknown>
) {
  const db = await getDb();
  const key = verseKey(remote.lang, remote.book, remote.chapter, remote.verse);
  const local = await db.get(store, key);
  if (!local || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
    await db.put(store, { ...remote, key, synced: true }, key);
  }
}

const READING_POSITION_KEY = 'current';

export async function getReadingPosition(): Promise<PositionRecord | undefined> {
  const db = await getDb();
  return db.get('readingPosition', READING_POSITION_KEY);
}
export async function setReadingPosition(lang: Lang, book: number, chapter: number) {
  const db = await getDb();
  await db.put('readingPosition', { lang, book, chapter, synced: false, updatedAt: new Date().toISOString() }, READING_POSITION_KEY);
}
export async function applyRemotePosition(remote: { lang: Lang; book: number; chapter: number; updatedAt: string }) {
  const db = await getDb();
  const local = await db.get('readingPosition', READING_POSITION_KEY);
  if (!local || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
    await db.put('readingPosition', { ...remote, synced: true }, READING_POSITION_KEY);
  }
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
