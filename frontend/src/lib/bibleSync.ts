import * as db from './bibleOfflineDb';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path: string, token: string, method: 'GET' | 'PUT' | 'DELETE', body?: unknown) {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function safely(label: string, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (err) {
    console.error(`bibleSync: ${label} failed`, err);
  }
}

async function pull(token: string) {
  await safely('pull bookmarks', async () => {
    const res = await request('/bible-reading/bookmarks', token, 'GET');
    if (!res.ok) return;
    const { bookmarks } = await res.json();
    for (const b of bookmarks) await db.applyRemoteBookmark(b);
  });

  await safely('pull highlights', async () => {
    const res = await request('/bible-reading/highlights', token, 'GET');
    if (!res.ok) return;
    const { highlights } = await res.json();
    for (const h of highlights) await db.applyRemoteHighlight(h);
  });

  await safely('pull notes', async () => {
    const res = await request('/bible-reading/notes', token, 'GET');
    if (!res.ok) return;
    const { notes } = await res.json();
    for (const n of notes) await db.applyRemoteNote(n);
  });

  await safely('pull position', async () => {
    const res = await request('/bible-reading/position', token, 'GET');
    if (!res.ok) return;
    const { position } = await res.json();
    if (position) await db.applyRemotePosition(position);
  });
}

async function push(token: string) {
  const { bookmarks, highlights, notes, position } = await db.getUnsyncedRecords();

  for (const b of bookmarks) {
    await safely(`push bookmark ${b.lang}-${b.book}-${b.chapter}-${b.verse}`, async () => {
      const res = await request(`/bible-reading/bookmarks/${b.lang}/${b.book}/${b.chapter}/${b.verse}`, token, 'PUT');
      if (res.ok) await db.markSynced('bookmark', `${b.lang}-${b.book}-${b.chapter}-${b.verse}`);
    });
  }

  for (const h of highlights) {
    await safely(`push highlight ${h.lang}-${h.book}-${h.chapter}-${h.verse}`, async () => {
      const res = await request(`/bible-reading/highlights/${h.lang}/${h.book}/${h.chapter}/${h.verse}`, token, 'PUT', { color: h.color });
      if (res.ok) await db.markSynced('highlight', `${h.lang}-${h.book}-${h.chapter}-${h.verse}`);
    });
  }

  for (const n of notes) {
    await safely(`push note ${n.lang}-${n.book}-${n.chapter}-${n.verse}`, async () => {
      const res = await request(`/bible-reading/notes/${n.lang}/${n.book}/${n.chapter}/${n.verse}`, token, 'PUT', { text: n.text });
      if (res.ok) await db.markSynced('note', `${n.lang}-${n.book}-${n.chapter}-${n.verse}`);
    });
  }

  if (position) {
    await safely('push position', async () => {
      const res = await request('/bible-reading/position', token, 'PUT', {
        lang: position.lang,
        book: position.book,
        chapter: position.chapter,
      });
      if (res.ok) await db.markSynced('position', `${position.lang}-${position.book}-${position.chapter}`);
    });
  }
}

async function flushDeletes(token: string) {
  const pending = await db.getPendingDeletes();
  for (const d of pending) {
    await safely(`delete ${d.kind} ${d.key}`, async () => {
      const path = d.kind === 'bookmark' ? 'bookmarks' : d.kind === 'highlight' ? 'highlights' : 'notes';
      const res = await request(`/bible-reading/${path}/${d.lang}/${d.book}/${d.chapter}/${d.verse}`, token, 'DELETE');
      if (res.ok || res.status === 404) await db.clearPendingDelete(d.key);
    });
  }
}

export async function syncBibleReadingData(): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) return;

  await pull(token);
  await push(token);
  await flushDeletes(token);
}
