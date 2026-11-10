import 'fake-indexeddb/auto';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import {
  getChapter, startBackgroundFill, getDownloadStatus, searchVerses,
  setBookmark, getBookmarks, deleteBookmark, getUnsyncedRecords, markSynced
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
