# Offline Bible Reader — Design

## Intent

Users can browse all 66 books, read any chapter, and search the full
Bible offline, in Kinyarwanda, English, or French. They can bookmark
verses, highlight them, attach notes, and resume reading where they left
off. The existing daily/featured-verse features are untouched; this is a
new, additive reader.

## Non-goals / anti-goals

- Not rebuilding the removed app-shell service worker. Offline Bible
  content works once the app has loaded online at least once; opening the
  app for the very first time with zero connectivity is out of scope.
- Not a general offline-sync framework for the rest of the app — only
  Bible text and the new personalization data (bookmarks/highlights/
  notes/reading position) go through this offline path.
- Not adding more translations than the three XML sources provide.

## Data sources

Three XML files (already on disk, not yet in the repo), one schema each:

- `~/Downloads/bysb.xml` — Kinyarwanda ("Bibiliya Yera"). Schema:
  `<BIBLEBOOK bnumber bname><CHAPTER cnumber><VERS vnumber>`. Book names
  are present per book.
- `~/Downloads/FrenchBible.xml` — French LSG 1910. Schema:
  `<bible><testament><book number><chapter number><verse number>`. No
  book names (numbers only).
- `~/Downloads/EnglishNIVBible.xml` — English NIV. Same schema as French.
  No book names.

All three use the standard 66-book Protestant canon, numbered 1
(Genesis) through 66 (Revelation), confirmed identical book counts and
numbering across all three files. Book *names* for English/French come
from a hardcoded canonical book-metadata table (number, osis-style slug,
English/French/Kinyarwanda name, testament, chapter count); Kinyarwanda
names are cross-checked against that table's rw column.

## Import pipeline

A one-time (re-run when source files change) Node script,
`api/scripts/import-bible.js`:

1. Parses each XML file with a lightweight XML parser (new dependency:
   `fast-xml-parser`, added to `api/package.json`).
2. Normalizes into one JSON structure per language per book:
   `{ book: 1, chapters: [ { chapter: 1, verses: ["...", "..."] }, ... ] }`
   (verse text indexed 0 = verse 1, stored as a plain array — no need to
   repeat verse numbers).
3. Writes output to `frontend/public/bible-data/<lang>/<bookNumber>.json`
   where `<lang>` is `rw` | `en` | `fr`, plus one
   `frontend/public/bible-data/<lang>/manifest.json` per language with
   per-book chapter/verse counts (used to show progress and validate
   cache completeness without downloading everything first).
4. Writes `frontend/src/data/bibleBooks.ts` — the canonical static
   book-metadata table (number, slug, names per language, testament,
   chapter count) used by the UI for navigation (book list, chapter
   picker) independent of any one language's data file.
5. Source XML files are copied into `api/bible-source/` (gitignored
   origin copies) so the import is reproducible; the generated
   `frontend/public/bible-data/**` JSON is committed (it's the shipped
   asset).

Total size: ~31,000 verses × 3 languages. Chunking per book keeps any
single fetch small (largest book, Psalms, is still well under 200KB of
JSON per language).

## Offline storage (frontend)

New dependency: `idb` (small Promise wrapper over IndexedDB).

One IndexedDB database, `bible-offline`, with object stores:

- `verses` — key `"<lang>-<book>-<chapter>"`, value the chapter's verse
  array. Populated lazily: reading a chapter fetches-and-caches it if
  missing, so a chapter the user has ever opened is available offline
  immediately, without waiting for a full-language download.
- `downloadStatus` — key `lang`, value `{ booksComplete: number[],
  complete: boolean }`, tracked as the full-language background download
  (below) progresses.
- `bookmarks`, `highlights`, `notes` — local-first personalization
  records (see below), each keyed by a client-generated id, with a
  `synced: boolean` flag.
- `readingPosition` — single record: `{ lang, book, chapter }`.

**Background full download:** after the default/current language's
*current chapter* is cached (so the user is never blocked on it), a
background task fetches the remaining chapters of that language in
book order, writing each into `verses` and updating `downloadStatus`,
so search (below) has something to search and the language is fully
usable offline. Switching to a second or third language kicks off the
same background fill for that language, on demand — never for a
language the user hasn't opened.

**Search:** once a language's `downloadStatus.complete` is true (or
partially — search runs over whatever chapters are already cached, and
says so if the language isn't fully downloaded yet), search is a
client-side scan: normalize (lowercase, strip accents/diacritics) the
query and every cached verse once, cache the normalized verse text in
memory for the session, and substring-match. At ~31,000 verses this is
sub-100ms in JS — no search index library needed.

## Personalization data (bookmarks, highlights, notes, reading position)

Referenced by `(lang, book, chapter, verse)` — not by a verse row id,
since the same verse exists once per translation and a bookmark should
be meaningful regardless of which translation is open.

**Local-first:** every write (bookmark toggle, highlight color, note
text, reading position) goes to IndexedDB immediately — this is what
makes it work offline, logged in or not.

**Sync for signed-in users:** new Prisma models, sync'd opportunistically
(on load, on reconnect, and after each local write, debounced) via a new
API route `api/routes/bible-reading.js`:

```prisma
model BibleBookmark {
  id        String   @id @default(cuid())
  userId    String
  lang      String
  book      Int
  chapter   Int
  verse     Int
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lang, book, chapter, verse])
  @@map("bible_bookmarks")
}

model BibleHighlight {
  id        String   @id @default(cuid())
  userId    String
  lang      String
  book      Int
  chapter   Int
  verse     Int
  color     String
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lang, book, chapter, verse])
  @@map("bible_highlights")
}

model BibleNote {
  id        String   @id @default(cuid())
  userId    String
  lang      String
  book      Int
  chapter   Int
  verse     Int
  text      String
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lang, book, chapter, verse])
  @@map("bible_notes")
}

model BibleReadingPosition {
  userId    String   @id
  lang      String
  book      Int
  chapter   Int
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("bible_reading_position")
}
```

Sync conflict rule: last-write-wins by `updatedAt`/`createdAt` — no
merge logic needed, since these are single-user, single-value-per-key
records. Not signed in: everything stays local-only (an existing
`SavedVerse`-style sign-in prompt pattern can nudge sign-up, but that's
a UI nicety, not required for v1).

## Frontend structure

New pages under `frontend/src/pages/bible-reader/`:

- `BibleHome.tsx` — book grid (grouped Old/New Testament), language
  switcher.
- `BibleChapter.tsx` — chapter reader: verse list, bookmark/highlight/
  note controls per verse, chapter prev/next, resumes at
  `readingPosition` on open.
- `BibleSearch.tsx` — search box + results, scoped to the current
  language, with a "still downloading" notice if that language isn't
  fully cached yet.

New hook `frontend/src/hooks/useBibleOffline.ts` wraps the IndexedDB
store (open db, get/cache chapter, background-fill, search, bookmark/
highlight/note CRUD, position) behind a plain async API so the pages
don't touch `idb` directly.

Routes added to the router alongside existing ones; a nav entry added
next to the existing Verses/Donate/Contact links. Existing
`BibleVerseManager`, `useBibleVerse`, `VerseOfTheDay`/featured-verse flow
are not modified.

## What's left to the builder

- Exact visual design of the reader pages (follows existing app
  patterns/Tailwind conventions already in use elsewhere).
- Exact debounce interval for sync-on-write.
- Whether the language switcher persists choice in `localStorage` vs.
  `readingPosition.lang` (small implementation detail, no behavior
  difference for the user).
