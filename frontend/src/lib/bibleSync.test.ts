import { beforeEach, it, expect, vi } from 'vitest';
import { syncBibleReadingData } from './bibleSync';
import * as db from './bibleOfflineDb';

beforeEach(() => {
  localStorage.setItem('token', 'tok');
  vi.spyOn(db, 'getUnsyncedRecords').mockResolvedValue({
    bookmarks: [{ lang: 'en', book: 1, chapter: 1, verse: 1 }],
    highlights: [], notes: [], position: null
  } as any);
  vi.spyOn(db, 'markSynced').mockResolvedValue(undefined);
  vi.spyOn(db, 'getPendingDeletes').mockResolvedValue([]);
  vi.spyOn(db, 'clearPendingDelete').mockResolvedValue(undefined);
  vi.spyOn(db, 'applyRemoteBookmark').mockResolvedValue(undefined);
  vi.spyOn(db, 'applyRemoteHighlight').mockResolvedValue(undefined);
  vi.spyOn(db, 'applyRemoteNote').mockResolvedValue(undefined);
  vi.spyOn(db, 'applyRemotePosition').mockResolvedValue(undefined);
  vi.stubGlobal('fetch', vi.fn(async (url: string, opts?: any) => {
    if (opts?.method === 'GET') {
      if (url.includes('/bookmarks')) return { ok: true, json: async () => ({ bookmarks: [] }) };
      if (url.includes('/highlights')) return { ok: true, json: async () => ({ highlights: [] }) };
      if (url.includes('/notes')) return { ok: true, json: async () => ({ notes: [] }) };
      if (url.includes('/position')) return { ok: true, json: async () => ({ position: null }) };
    }
    return { ok: true, json: async () => ({ bookmark: {} }) };
  }));
});

it('does nothing when there is no auth token', async () => {
  localStorage.removeItem('token');
  await syncBibleReadingData();
  expect(fetch).not.toHaveBeenCalled();
});

it('PUTs each unsynced bookmark and marks it synced on success', async () => {
  await syncBibleReadingData();
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/bible-reading/bookmarks/en/1/1/1'),
    expect.objectContaining({ method: 'PUT' })
  );
  expect(db.markSynced).toHaveBeenCalledWith('bookmark', 'en-1-1-1');
});

it('leaves a record unsynced when the PUT request fails', async () => {
  (fetch as any).mockImplementation(async (_url: string, opts?: any) => {
    if (opts?.method === 'PUT') return { ok: false };
    return { ok: true, json: async () => ({ bookmarks: [], highlights: [], notes: [], position: null }) };
  });
  await syncBibleReadingData();
  expect(db.markSynced).not.toHaveBeenCalled();
});

it('pulls remote bookmarks/highlights/notes/position and applies each to local storage', async () => {
  const remoteBookmark = { lang: 'fr', book: 2, chapter: 3, verse: 4 };
  const remoteHighlight = { lang: 'fr', book: 2, chapter: 3, verse: 5, color: 'yellow', updatedAt: '2026-01-01T00:00:00.000Z' };
  const remoteNote = { lang: 'fr', book: 2, chapter: 3, verse: 6, text: 'hi', updatedAt: '2026-01-01T00:00:00.000Z' };
  const remotePosition = { lang: 'fr', book: 2, chapter: 3, updatedAt: '2026-01-01T00:00:00.000Z' };

  (fetch as any).mockImplementation(async (url: string, opts?: any) => {
    if (opts?.method !== 'GET') return { ok: true, json: async () => ({ bookmark: {} }) }; // push calls
    if (url.includes('/bookmarks')) return { ok: true, json: async () => ({ bookmarks: [remoteBookmark] }) };
    if (url.includes('/highlights')) return { ok: true, json: async () => ({ highlights: [remoteHighlight] }) };
    if (url.includes('/notes')) return { ok: true, json: async () => ({ notes: [remoteNote] }) };
    if (url.includes('/position')) return { ok: true, json: async () => ({ position: remotePosition }) };
    return { ok: false };
  });

  await syncBibleReadingData();

  expect(db.applyRemoteBookmark).toHaveBeenCalledWith(remoteBookmark);
  expect(db.applyRemoteHighlight).toHaveBeenCalledWith(remoteHighlight);
  expect(db.applyRemoteNote).toHaveBeenCalledWith(remoteNote);
  expect(db.applyRemotePosition).toHaveBeenCalledWith(remotePosition);
});

it('sends a DELETE for each pending tombstone and clears it on success', async () => {
  vi.spyOn(db, 'getPendingDeletes').mockResolvedValue([
    { key: 'en-1-1-1', kind: 'bookmark', lang: 'en', book: 1, chapter: 1, verse: 1 }
  ] as any);

  await syncBibleReadingData();

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/bible-reading/bookmarks/en/1/1/1'),
    expect.objectContaining({ method: 'DELETE' })
  );
  expect(db.clearPendingDelete).toHaveBeenCalledWith('en-1-1-1');
});

it('never rejects, even when the network is unreachable', async () => {
  (fetch as any).mockImplementation(async () => { throw new TypeError('Failed to fetch'); });
  await expect(syncBibleReadingData()).resolves.toBeUndefined();
  expect(db.markSynced).not.toHaveBeenCalled();
});
