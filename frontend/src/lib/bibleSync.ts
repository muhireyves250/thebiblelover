import * as db from './bibleOfflineDb';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function put(path: string, token: string, body?: unknown) {
  return fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function syncBibleReadingData(): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) return;

  const { bookmarks, highlights, notes, position } = await db.getUnsyncedRecords();

  for (const b of bookmarks) {
    const res = await put(`/bible-reading/bookmarks/${b.lang}/${b.book}/${b.chapter}/${b.verse}`, token);
    if (res.ok) await db.markSynced('bookmark', `${b.lang}-${b.book}-${b.chapter}-${b.verse}`);
  }

  for (const h of highlights) {
    const res = await put(`/bible-reading/highlights/${h.lang}/${h.book}/${h.chapter}/${h.verse}`, token, { color: h.color });
    if (res.ok) await db.markSynced('highlight', `${h.lang}-${h.book}-${h.chapter}-${h.verse}`);
  }

  for (const n of notes) {
    const res = await put(`/bible-reading/notes/${n.lang}/${n.book}/${n.chapter}/${n.verse}`, token, { text: n.text });
    if (res.ok) await db.markSynced('note', `${n.lang}-${n.book}-${n.chapter}-${n.verse}`);
  }

  if (position) {
    const res = await put('/bible-reading/position', token, {
      lang: position.lang,
      book: position.book,
      chapter: position.chapter,
    });
    if (res.ok) await db.markSynced('position', `${position.lang}-${position.book}-${position.chapter}`);
  }
}
