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
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ bookmark: {} }) })));
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

it('leaves a record unsynced when the request fails', async () => {
  (fetch as any).mockResolvedValue({ ok: false });
  await syncBibleReadingData();
  expect(db.markSynced).not.toHaveBeenCalled();
});
