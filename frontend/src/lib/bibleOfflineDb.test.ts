import 'fake-indexeddb/auto';
import { beforeEach, it, expect, vi } from 'vitest';
import {
  getChapter, startBackgroundFill, getDownloadStatus, searchVerses,
  setBookmark, getBookmarks, deleteBookmark, getUnsyncedRecords, markSynced,
  getPendingDeletes, clearPendingDelete,
  setNote, getNotes, applyRemoteNote, applyRemoteBookmark,
} from './bibleOfflineDb';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url === '/bible-data/en/1.json') {
      return { ok: true, json: async () => [['In the beginning...', 'v2'], ['Chapter 2 v1']] };
    }
    return { ok: false };
  }));
});

it('getChapter fetches and caches on first read, then serves from cache', async () => {
  const first = await getChapter('en', 1, 1);
  expect(first).toEqual({ verses: ['In the beginning...', 'v2'], source: 'network' });
  const second = await getChapter('en', 1, 1);
  expect(second).toEqual({ verses: ['In the beginning...', 'v2'], source: 'cache' });
  expect(fetch).toHaveBeenCalledTimes(1); // whole-book fetch cached chapter 2 too
});

it('getChapter returns an offline-miss instead of throwing when uncached and fetch fails', async () => {
  const result = await getChapter('fr', 99, 1);
  expect(result).toEqual({ error: 'offline-miss' });
});

it('getChapter returns an offline-miss instead of rejecting when the response body is not valid JSON', async () => {
  (fetch as any).mockImplementation(async (url: string) => {
    if (url === '/bible-data/fr/50.json') {
      return { ok: true, json: async () => { throw new SyntaxError('Unexpected token <'); } };
    }
    return { ok: false };
  });
  const result = await getChapter('fr', 50, 1);
  expect(result).toEqual({ error: 'offline-miss' });
});

it('searchVerses matches accent-insensitively over cached verses', async () => {
  (fetch as any).mockImplementation(async (url: string) => {
    if (url === '/bible-data/fr/1.json') return { ok: true, json: async () => [["Dieu créa les cieux."]] };
    return { ok: false };
  });
  await getChapter('fr', 1, 1); // populates cache for book 1
  const results = await searchVerses('fr', 'crea'); // typed without the accent
  expect(results).toEqual([{ book: 1, chapter: 1, verse: 1, text: 'Dieu créa les cieux.' }]);
});

it('fills two languages concurrently without one corrupting the other', async () => {
  (fetch as any).mockImplementation(async (url: string) => {
    if (url === '/bible-data/en/1.json') return { ok: true, json: async () => [['en verse']] };
    if (url === '/bible-data/fr/1.json') return { ok: true, json: async () => [['fr verse']] };
    return { ok: false };
  });
  startBackgroundFill('en');
  startBackgroundFill('fr');
  await vi.waitFor(async () => {
    expect((await getDownloadStatus('en')).booksComplete).toContain(1);
    expect((await getDownloadStatus('fr')).booksComplete).toContain(1);
  });
  expect(await getChapter('en', 1, 1)).toEqual({ verses: ['en verse'], source: 'cache' });
  expect(await getChapter('fr', 1, 1)).toEqual({ verses: ['fr verse'], source: 'cache' });
});

it('setBookmark/getBookmarks/deleteBookmark round-trip and track sync state', async () => {
  await setBookmark('en', 1, 1, 1);
  expect(await getBookmarks()).toEqual([
    expect.objectContaining({ lang: 'en', book: 1, chapter: 1, verse: 1, synced: false })
  ]);
  const { bookmarks } = await getUnsyncedRecords();
  expect(bookmarks).toHaveLength(1);
  await markSynced('bookmark', 'en-1-1-1');
  const { bookmarks: afterSync } = await getUnsyncedRecords();
  expect(afterSync).toHaveLength(0);
  await deleteBookmark('en', 1, 1, 1);
  expect(await getBookmarks()).toEqual([]);
});

it('deleting an already-synced bookmark queues a pending delete; deleting an unsynced one does not', async () => {
  await setBookmark('en', 5, 1, 1);
  await markSynced('bookmark', 'en-5-1-1');
  await deleteBookmark('en', 5, 1, 1);
  const tombstone = (await getPendingDeletes()).find((d) => d.key === 'en-5-1-1');
  expect(tombstone).toEqual(
    expect.objectContaining({ key: 'en-5-1-1', kind: 'bookmark', lang: 'en', book: 5, chapter: 1, verse: 1 })
  );

  await clearPendingDelete('en-5-1-1');
  expect((await getPendingDeletes()).find((d) => d.key === 'en-5-1-1')).toBeUndefined();

  await setBookmark('en', 6, 1, 1); // never synced
  await deleteBookmark('en', 6, 1, 1);
  expect((await getPendingDeletes()).find((d) => d.key === 'en-6-1-1')).toBeUndefined();
});

it('applyRemoteNote: a newer remote edit overwrites an older local one and marks it synced', async () => {
  await setNote('en', 7, 1, 1, 'old local edit'); // updatedAt = now
  const newerThanNow = new Date(Date.now() + 60_000).toISOString();
  await applyRemoteNote({ lang: 'en', book: 7, chapter: 1, verse: 1, text: 'newer remote edit', updatedAt: newerThanNow });
  const target = (await getNotes()).find(n => n.key === 'en-7-1-1')!;
  expect(target).toEqual(expect.objectContaining({ text: 'newer remote edit', synced: true }));
});

it('applyRemoteNote: an older remote edit does not overwrite a newer unsynced local one', async () => {
  await setNote('en', 8, 1, 1, 'newest local edit'); // updatedAt = now
  const olderThanNow = new Date(Date.now() - 60_000).toISOString();
  await applyRemoteNote({ lang: 'en', book: 8, chapter: 1, verse: 1, text: 'stale remote', updatedAt: olderThanNow });
  const target = (await getNotes()).find(n => n.key === 'en-8-1-1')!;
  expect(target).toEqual(expect.objectContaining({ text: 'newest local edit', synced: false }));
});

it('applyRemoteBookmark adds a remote bookmark not present locally, marked synced', async () => {
  await applyRemoteBookmark({ lang: 'en', book: 9, chapter: 1, verse: 1 });
  const target = (await getBookmarks()).find(b => b.key === 'en-9-1-1')!;
  expect(target).toEqual(expect.objectContaining({ lang: 'en', book: 9, chapter: 1, verse: 1, synced: true }));
});

it('searchVerses returns results in Bible order (book, then chapter, then verse), not cache-key string order', async () => {
  (fetch as any).mockImplementation(async (url: string) => {
    if (url === '/bible-data/en/10.json') return { ok: true, json: async () => [['match in book 10']] };
    if (url === '/bible-data/en/2.json') return { ok: true, json: async () => [['match in book 2']] };
    return { ok: false };
  });
  // Cache book 10 first, so its key ("en-10-1") would sort before "en-2-1"
  // as a plain string even though book 2 comes first in the Bible.
  await getChapter('en', 10, 1);
  await getChapter('en', 2, 1);

  const results = await searchVerses('en', 'match');
  expect(results.map(r => r.book)).toEqual([2, 10]);
});
