# Offline Bible Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users browse all 66 books, read any chapter, and search the whole Bible offline in Kinyarwanda/English/French, with bookmarks, highlights, notes, and resume-reading, without touching the existing daily/featured-verse features.

**Architecture:** A one-time import script converts three source XML files (one schema each) into per-book JSON shipped as static assets. The frontend caches chapters into IndexedDB on read and fills the rest of a language in the background, so reading/search work offline after first load. Bookmarks/highlights/notes/position write to IndexedDB first (offline-capable) and sync to new Prisma models for signed-in users.

**Tech Stack:** Express + Prisma + Postgres (api), React + Vite + TypeScript (frontend), new deps: `fast-xml-parser` (api), `idb` (frontend runtime), `vitest` + `jsdom` + `fake-indexeddb` (frontend dev/test only — this repo has no frontend test runner yet).

**Spec:** [docs/superpowers/specs/2026-11-10-offline-bible-reader-design.md](../specs/2026-11-10-offline-bible-reader-design.md)

## Global Constraints

- Source XML files live at `~/Downloads/bysb.xml` (Kinyarwanda), `~/Downloads/FrenchBible.xml`, `~/Downloads/EnglishNIVBible.xml` — all 66 books, same numbering (1=Genesis…66=Revelation), confirmed in the spec.
- Language codes throughout the stack: `rw`, `en`, `fr`.
- Generated Bible text JSON ships from `frontend/public/bible-data/<lang>/<bookNumber>.json` + `frontend/public/bible-data/<lang>/manifest.json`.
- Personalization records key on `(userId, lang, book, chapter, verse)`, never on a translation-specific verse row id.
- The app must be installable and work fully offline from the first launch after install, in all three languages immediately (no later download needed) — this requires a service worker (Task 9), added via `vite-plugin-pwa` so redeploys stay safe (content-hashed, versioned precache — see the spec's "Revision note" and "PWA install & offline app shell" sections for why this avoids the bug that got the previous hand-rolled service worker removed).
- Existing `BibleVerse`, `VerseOfTheDay`, `SavedVerse` models/routes/pages are not modified.
- This repo has no DB-backed test harness (no test DB config exists). Route tests mock `../lib/prisma.js` rather than hitting real Postgres; the migration itself is verified by running it, not by an automated test.

## Review Focus

- **Verse text containing a straight/curly quote or `&` character** (seen in the English NIV sample: `"Let there be light,"`): the XML parser and the JSON round-trip must preserve it exactly — a naive `JSON.stringify`/`parse` is fine, but a test should pin a verse with a quote and an apostrophe.
- **A chapter requested before its data has ever been fetched, while offline** (e.g., user cached chapter 1 online, goes offline, taps chapter 2 of the same book): `getChapter` must distinguish "not yet cached, fetch failed" from "cached, here it is" and surface an explicit offline-miss state the UI can show, not throw an unhandled rejection.
- **Switching languages mid-way through a background download**: starting a second language's fill must not cancel or corrupt the first language's in-progress fill — both proceed independently (per-language fill state).
- **Two devices editing the same verse's note while one was offline**: last-write-wins by `updatedAt` is the documented rule — a sync test must show the older-`updatedAt` record losing, not being merged or duplicated.
- **Search query with accented characters typed without accents** (e.g., Kinyarwanda `cyangwa` vs French `créa` typed `crea`): the spec requires accent-insensitive matching — a test must confirm `"crea"` matches `"créa"`.

---

## Task 1: XML parsing library

**Files:**
- Create: `api/scripts/lib/bibleXmlParser.js`
- Test: `api/scripts/lib/bibleXmlParser.test.js`
- Modify: `api/package.json` (add `fast-xml-parser` to `dependencies`)

**Interfaces:**
- Produces: `parseBibleXml(xml: string, schema: 'named' | 'numbered'): ParsedBook[]`, where
  `ParsedBook = { number: number, name: string | null, chapters: ParsedChapter[] }`
  and `ParsedChapter = { number: number, verses: string[] }` (`verses[0]` is verse 1, each entry whitespace-trimmed with internal newlines collapsed to single spaces).
  - `schema: 'named'` parses the Kinyarwanda `<BIBLEBOOK bnumber bname><CHAPTER cnumber><VERS vnumber>` shape and fills `name` from `bname`.
  - `schema: 'numbered'` parses the French/English `<book number><chapter number><verse number>` shape (nested under `<bible><testament>`, testament boundaries don't matter — just flatten all `<book>` elements in document order) and leaves `name: null`.

- [ ] **Step 1: Write the failing tests**

```js
const { parseBibleXml } = require('./bibleXmlParser');

const namedFixture = `<?xml version="1.0" encoding="UTF-8"?>
<XMLBIBLE biblename="Test">
  <BIBLEBOOK bnumber="1" bname="Itangiriro">
    <CHAPTER cnumber="1">
      <VERS vnumber="1">Mbere na mbere Imana yaremye ijuru n'isi.</VERS>
      <VERS vnumber="2">Umucyo "Habeho" &amp; umwijima.</VERS>
    </CHAPTER>
  </BIBLEBOOK>
</XMLBIBLE>`;

const numberedFixture = `<?xml version="1.0" encoding="UTF-8"?>
<bible translation="Test">
  <testament name="Old">
    <book number="1">
      <chapter number="1">
        <verse number="1">In the beginning God created the heavens and the earth.</verse>
        <verse number="2">And God said, "Let there be light," and there was light.</verse>
      </chapter>
    </book>
  </testament>
</bible>`;

const singleVerseFixture = `<?xml version="1.0" encoding="UTF-8"?>
<bible>
  <testament name="Old">
    <book number="1">
      <chapter number="1">
        <verse number="1">Only verse.</verse>
      </chapter>
    </book>
  </testament>
</bible>`;

test('parses named (Kinyarwanda) schema, preserving book name and quote/ampersand text', () => {
  const books = parseBibleXml(namedFixture, 'named');
  expect(books).toEqual([
    { number: 1, name: 'Itangiriro', chapters: [
      { number: 1, verses: [
        "Mbere na mbere Imana yaremye ijuru n'isi.",
        'Umucyo "Habeho" & umwijima.'
      ] }
    ] }
  ]);
});

test('parses numbered (French/English) schema with no book name', () => {
  const books = parseBibleXml(numberedFixture, 'numbered');
  expect(books).toEqual([
    { number: 1, name: null, chapters: [
      { number: 1, verses: [
        'In the beginning God created the heavens and the earth.',
        'And God said, "Let there be light," and there was light.'
      ] }
    ] }
  ]);
});

test('does not collapse a single verse/chapter/book into a non-array', () => {
  const books = parseBibleXml(singleVerseFixture, 'numbered');
  expect(books).toEqual([
    { number: 1, name: null, chapters: [ { number: 1, verses: ['Only verse.'] } ] }
  ]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd api && npx jest scripts/lib/bibleXmlParser.test.js`
Expected: FAIL with "Cannot find module './bibleXmlParser'"

- [ ] **Step 3: Add `fast-xml-parser` and implement `parseBibleXml`**

Run `npm install fast-xml-parser` in `api/`. Implement with `fast-xml-parser`'s `XMLParser`, configured with `ignoreAttributes: false`, `attributeNamePrefix: ''`, and an `isArray` callback that forces `BIBLEBOOK`, `CHAPTER`, `VERS`, `book`, `chapter`, `verse` to always parse as arrays (this is the one non-obvious library gotcha the tests above are specifically written to catch — without it, a book/chapter/verse that is the only one of its kind collapses to a bare object instead of a one-element array). Trim each verse's text node and collapse internal whitespace/newlines to single spaces before returning.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd api && npx jest scripts/lib/bibleXmlParser.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add api/scripts/lib/bibleXmlParser.js api/scripts/lib/bibleXmlParser.test.js api/package.json api/package-lock.json
git commit -m "feat: add Bible XML parser for named and numbered book schemas"
```

---

## Task 2: Canonical book metadata

**Files:**
- Create: `frontend/src/data/bibleBooks.ts`
- Test: `frontend/src/data/bibleBooks.test.ts`
- Create: `frontend/vitest.config.ts`
- Modify: `frontend/package.json` (add `vitest`, `jsdom`, `fake-indexeddb` to `devDependencies`; add `"test": "vitest run"` script)

**Interfaces:**
- Produces: `BIBLE_BOOKS: BibleBookMeta[]`, where
  `BibleBookMeta = { number: number, slug: string, testament: 'OT' | 'NT', chapterCount: number, names: { rw: string, en: string, fr: string } }`,
  exported from `frontend/src/data/bibleBooks.ts`. `slug` is the lowercase English name with spaces replaced by `-` (e.g. `'song-of-solomon'`).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { BIBLE_BOOKS } from './bibleBooks';

describe('BIBLE_BOOKS', () => {
  it('has exactly 66 books numbered 1-66 with no gaps or duplicates', () => {
    const numbers = BIBLE_BOOKS.map(b => b.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 66 }, (_, i) => i + 1));
  });

  it('has 39 Old Testament and 27 New Testament books', () => {
    expect(BIBLE_BOOKS.filter(b => b.testament === 'OT')).toHaveLength(39);
    expect(BIBLE_BOOKS.filter(b => b.testament === 'NT')).toHaveLength(27);
  });

  it('gives every book a name in all three languages and a positive chapter count', () => {
    for (const book of BIBLE_BOOKS) {
      expect(book.names.rw.length).toBeGreaterThan(0);
      expect(book.names.en.length).toBeGreaterThan(0);
      expect(book.names.fr.length).toBeGreaterThan(0);
      expect(book.chapterCount).toBeGreaterThan(0);
    }
  });

  it('book 1 is Genesis/Itangiriro/Genèse with 50 chapters, book 66 is Revelation with 22 chapters', () => {
    const genesis = BIBLE_BOOKS.find(b => b.number === 1)!;
    const revelation = BIBLE_BOOKS.find(b => b.number === 66)!;
    expect(genesis.names).toEqual({ rw: 'Itangiriro', en: 'Genesis', fr: 'Genèse' });
    expect(genesis.chapterCount).toBe(50);
    expect(revelation.chapterCount).toBe(22);
  });
});
```

- [ ] **Step 2: Add vitest config and run the test to verify it fails**

`frontend/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom' } });
```

Run: `cd frontend && npx vitest run src/data/bibleBooks.test.ts`
Expected: FAIL with "Cannot find module './bibleBooks'"

- [ ] **Step 3: Write `BIBLE_BOOKS`**

Hardcode all 66 entries (standard Protestant canon order, matching the numbering already confirmed identical across all three source XML files). Chapter counts and English/French names are the standard, well-known values (e.g. Genesis=50, Exodus=40, ... Revelation=22); Kinyarwanda names come from `bysb.xml`'s `bname` attributes — read that file (`~/Downloads/bysb.xml`) to copy all 66 `bname` values verbatim into the `rw` column, in book-number order, rather than guessing them.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && npx vitest run src/data/bibleBooks.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/data/bibleBooks.ts frontend/src/data/bibleBooks.test.ts frontend/vitest.config.ts frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat: add canonical 66-book Bible metadata table"
```

---

## Task 3: Import script and generated data assets

**Files:**
- Create: `api/scripts/import-bible.js`
- Test: `api/scripts/import-bible.test.js`
- Create (generated, not hand-written): `frontend/public/bible-data/rw/*.json`, `frontend/public/bible-data/en/*.json`, `frontend/public/bible-data/fr/*.json`
- Modify: `api/.gitignore` (add `bible-source/`)

**Interfaces:**
- Consumes: `parseBibleXml` from Task 1 (`api/scripts/lib/bibleXmlParser.js`).
- Produces: a CLI script, run as `node api/scripts/import-bible.js`, that reads `api/bible-source/rw.xml` (named schema), `api/bible-source/en.xml`, `api/bible-source/fr.xml` (numbered schema) and writes, per language:
  - `frontend/public/bible-data/<lang>/<bookNumber>.json` — body `string[][]` (chapters, each a verse array; `data[0][0]` is book N chapter 1 verse 1).
  - `frontend/public/bible-data/<lang>/manifest.json` — body `{ [bookNumber: string]: { chapters: number, versesPerChapter: number[] } }`.
- A pure function `buildManifest(books: ParsedBook[]): Manifest` is exported from `import-bible.js` for testing (the CLI's file-reading/writing is not unit tested — it's exercised for real in Step 5).

- [ ] **Step 1: Write the failing test for `buildManifest`**

```js
const { buildManifest } = require('./import-bible');

test('buildManifest counts chapters and verses per book', () => {
  const books = [
    { number: 1, name: 'Itangiriro', chapters: [
      { number: 1, verses: ['a', 'b'] },
      { number: 2, verses: ['c'] }
    ] }
  ];
  expect(buildManifest(books)).toEqual({
    '1': { chapters: 2, versesPerChapter: [2, 1] }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd api && npx jest scripts/import-bible.test.js`
Expected: FAIL with "Cannot find module './import-bible'"

- [ ] **Step 3: Implement `buildManifest` and the CLI**

`buildManifest(books)` maps each book to `{ chapters: book.chapters.length, versesPerChapter: book.chapters.map(c => c.verses.length) }`, keyed by `String(book.number)`. The CLI body: for each of the 3 languages, read its source file, call `parseBibleXml` with the right schema, write one `<bookNumber>.json` per book (`JSON.stringify(book.chapters.map(c => c.verses))`) and one `manifest.json` (`JSON.stringify(buildManifest(books))`) into `frontend/public/bible-data/<lang>/`, creating directories as needed.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd api && npx jest scripts/import-bible.test.js`
Expected: PASS

- [ ] **Step 5: Generate the real data**

```bash
mkdir -p api/bible-source
cp ~/Downloads/bysb.xml api/bible-source/rw.xml
cp ~/Downloads/EnglishNIVBible.xml api/bible-source/en.xml
cp ~/Downloads/FrenchBible.xml api/bible-source/fr.xml
echo "bible-source/" >> api/.gitignore
node api/scripts/import-bible.js
```

Verify: `frontend/public/bible-data/rw/1.json` through `66.json` exist for all three languages, and each language's `manifest.json` has exactly 66 keys whose `chapters` values match `BIBLE_BOOKS[n].chapterCount` from Task 2 (spot-check Genesis=50 and Revelation=22 for all three languages).

- [ ] **Step 6: Commit**

```bash
git add api/scripts/import-bible.js api/scripts/import-bible.test.js api/.gitignore frontend/public/bible-data
git commit -m "feat: generate per-book, per-language Bible text JSON from source XML"
```

---

## Task 4: Prisma schema for personalization

**Files:**
- Modify: `api/prisma/schema.prisma`
- Modify: `api/prisma/schema.prisma`'s `User` model (add the 4 new back-relations)

**Interfaces:**
- Produces: Prisma models `BibleBookmark`, `BibleHighlight`, `BibleNote`, `BibleReadingPosition` exactly as specified in the spec's Prisma block (copy verbatim), each with a `user BibleBookmark[]`-style back-relation added to `model User`.

- [ ] **Step 1: Add the 4 models to `api/prisma/schema.prisma`**

Copy the `BibleBookmark`, `BibleHighlight`, `BibleNote`, `BibleReadingPosition` model blocks verbatim from the spec's "Personalization data" section. Add to `model User`: `bibleBookmarks BibleBookmark[]`, `bibleHighlights BibleHighlight[]`, `bibleNotes BibleNote[]`, `bibleReadingPosition BibleReadingPosition?`.

- [ ] **Step 2: Validate and generate the migration**

Run: `cd api && npx prisma validate`
Expected: "The schema is valid" (fix any typo before continuing)

Run: `cd api && npx prisma migrate dev --name add_bible_personalization`
Expected: migration file created under `api/prisma/migrations/`, applies cleanly against the dev DB, `npx prisma generate` runs as part of it with no errors.

- [ ] **Step 3: Commit**

```bash
git add api/prisma/schema.prisma api/prisma/migrations
git commit -m "feat: add Bible bookmark/highlight/note/reading-position models"
```

---

## Task 5: Bible reading API routes

**Files:**
- Create: `api/routes/bible-reading.js`
- Test: `api/routes/bible-reading.test.js`
- Modify: `api/server.js` (import and mount the router)

**Interfaces:**
- Consumes: `verifyToken` from `api/middleware/auth.js` (existing — see `api/routes/bible-verses.js` for the usage pattern); `prisma` from `api/lib/prisma.js`; the 4 models from Task 4.
- Produces: router mounted at `/api/bible-reading`, all routes behind `verifyToken`:
  - `GET /bookmarks` → `{ bookmarks: BibleBookmark[] }` for `req.user.id`
  - `PUT /bookmarks/:lang/:book/:chapter/:verse` → upsert, 200 `{ bookmark }`
  - `DELETE /bookmarks/:lang/:book/:chapter/:verse` → 204
  - `GET /highlights` → `{ highlights: BibleHighlight[] }`
  - `PUT /highlights/:lang/:book/:chapter/:verse` with body `{ color: string }` → upsert, 200 `{ highlight }`
  - `DELETE /highlights/:lang/:book/:chapter/:verse` → 204
  - `GET /notes` → `{ notes: BibleNote[] }`
  - `PUT /notes/:lang/:book/:chapter/:verse` with body `{ text: string }` → upsert, 200 `{ note }`
  - `DELETE /notes/:lang/:book/:chapter/:verse` → 204
  - `GET /position` → `{ position: BibleReadingPosition | null }`
  - `PUT /position` with body `{ lang, book, chapter }` → upsert, 200 `{ position }`

- [ ] **Step 1: Write the failing tests (mocking Prisma)**

```js
jest.mock('../lib/prisma.js', () => ({
  prisma: {
    bibleBookmark: { findMany: jest.fn(), upsert: jest.fn(), delete: jest.fn() },
    bibleReadingPosition: { findUnique: jest.fn(), upsert: jest.fn() }
  }
}));
jest.mock('../middleware/auth.js', () => ({
  verifyToken: (req, res, next) => { req.user = { id: 'user-1' }; next(); }
}));

const request = require('supertest');
const express = require('express');
const { prisma } = require('../lib/prisma.js');
const bibleReadingRoutes = require('./bible-reading.js');

const app = express();
app.use(express.json());
app.use('/api/bible-reading', bibleReadingRoutes);

test('PUT /bookmarks/:lang/:book/:chapter/:verse upserts and returns the bookmark', async () => {
  prisma.bibleBookmark.upsert.mockResolvedValue({ id: 'b1', userId: 'user-1', lang: 'en', book: 1, chapter: 1, verse: 1 });
  const res = await request(app).put('/api/bible-reading/bookmarks/en/1/1/1').send();
  expect(res.status).toBe(200);
  expect(res.body.bookmark.id).toBe('b1');
  expect(prisma.bibleBookmark.upsert).toHaveBeenCalledWith(expect.objectContaining({
    where: { userId_lang_book_chapter_verse: { userId: 'user-1', lang: 'en', book: 1, chapter: 1, verse: 1 } }
  }));
});

test('PUT /position upserts by userId and returns the position', async () => {
  prisma.bibleReadingPosition.upsert.mockResolvedValue({ userId: 'user-1', lang: 'fr', book: 2, chapter: 3 });
  const res = await request(app).put('/api/bible-reading/position').send({ lang: 'fr', book: 2, chapter: 3 });
  expect(res.status).toBe(200);
  expect(res.body.position).toEqual({ userId: 'user-1', lang: 'fr', book: 2, chapter: 3 });
});

test('GET /bookmarks returns the signed-in user\'s bookmarks only', async () => {
  prisma.bibleBookmark.findMany.mockResolvedValue([{ id: 'b1' }]);
  const res = await request(app).get('/api/bible-reading/bookmarks');
  expect(res.status).toBe(200);
  expect(res.body.bookmarks).toEqual([{ id: 'b1' }]);
  expect(prisma.bibleBookmark.findMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd api && npx jest routes/bible-reading.test.js`
Expected: FAIL with "Cannot find module './bible-reading.js'"

- [ ] **Step 3: Implement the router**

Follow the existing pattern in `api/routes/bible-verses.js` (express.Router, `verifyToken` middleware applied per-route or via `router.use`). Each `:lang/:book/:chapter/:verse` route parses `book`/`chapter`/`verse` with `Number(...)`. Upserts use Prisma's compound-unique-key object naming convention: `<field>_<field>_..._<field>` in declaration order from the `@@unique`/`@id` — i.e. `userId_lang_book_chapter_verse` for bookmarks/highlights/notes (matches the test's `where` assertion), `userId` alone for position (it's the `@id`).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd api && npx jest routes/bible-reading.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Mount the router in `api/server.js`**

Add `import bibleReadingRoutes from './routes/bible-reading.js';` near the other route imports, and `app.use('/api/bible-reading', bibleReadingRoutes);` next to the other `app.use('/api/...')` lines (around line 144-145).

- [ ] **Step 6: Commit**

```bash
git add api/routes/bible-reading.js api/routes/bible-reading.test.js api/server.js
git commit -m "feat: add bible-reading API for bookmarks, highlights, notes, reading position"
```

---

## Task 6: Offline storage layer (IndexedDB)

**Files:**
- Create: `frontend/src/lib/bibleOfflineDb.ts`
- Test: `frontend/src/lib/bibleOfflineDb.test.ts`
- Modify: `frontend/package.json` (add `idb` to `dependencies`)

**Interfaces:**
- Consumes: `BIBLE_BOOKS` from Task 2 (for chapter counts, to know when a language's fill is complete).
- Produces, from `frontend/src/lib/bibleOfflineDb.ts`:
  - `getChapter(lang: Lang, book: number, chapter: number): Promise<{ verses: string[], source: 'cache' | 'network' } | { error: 'offline-miss' }>` — returns cached verses if present; otherwise fetches `/bible-data/<lang>/<book>.json`, caches the whole book's chapters, and returns the requested one; if the fetch fails (offline) and nothing is cached, returns `{ error: 'offline-miss' }` instead of throwing.
  - `startBackgroundFill(lang: Lang, onProgress?: (booksComplete: number) => void): void` — fire-and-forget; fetches and caches every book not yet cached for `lang`, in book-number order, one at a time; safe to call concurrently for two different languages (independent per-language state, tracked in the `downloadStatus` store); calling it again for a language already filling is a no-op.
  - `getDownloadStatus(lang: Lang): Promise<{ booksComplete: number[], complete: boolean }>`
  - `searchVerses(lang: Lang, query: string): Promise<Array<{ book: number, chapter: number, verse: number, text: string }>>` — accent- and case-insensitive substring match (normalize both query and verse text with `.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')` before comparing) over every verse currently cached for `lang`.
  - Local CRUD mirroring the API shapes from Task 5, each keyed by `${lang}-${book}-${chapter}-${verse}`, each record carrying `synced: boolean`:
    `getBookmarks/setBookmark/deleteBookmark`, `getHighlights/setHighlight/deleteHighlight`, `getNotes/setNote/deleteNote`, `getReadingPosition/setReadingPosition`.
  - `getUnsyncedRecords(): Promise<{ bookmarks: ..., highlights: ..., notes: ..., position: ... }>` and `markSynced(kind, key): Promise<void>` — used by Task 7's sync service.

- [ ] **Step 1: Write the failing tests**

```ts
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
```

- [ ] **Step 2: Add `fake-indexeddb` to devDependencies and run the tests to verify they fail**

Run: `cd frontend && npx vitest run src/lib/bibleOfflineDb.test.ts`
Expected: FAIL with "Cannot find module './bibleOfflineDb'"

- [ ] **Step 3: Install `idb` and implement `bibleOfflineDb.ts`**

Run `npm install idb` in `frontend/`. Open one `idb` database (`openDB('bible-offline', 1, { upgrade })`) creating the object stores from the spec (`verses`, `downloadStatus`, `bookmarks`, `highlights`, `notes`, `readingPosition`). `getChapter` reads `verses` store by key `` `${lang}-${book}-${chapter}` ``; on miss, fetches `/bible-data/<lang>/<book>.json`, and on success writes every chapter of that book into the store (so one fetch satisfies the whole book) before returning the requested chapter; on fetch failure, checks the store once more and returns `{ error: 'offline-miss' }` only if still absent. `startBackgroundFill` keeps an in-memory `Set<Lang>` of languages currently filling to make re-entrant calls a no-op, and loops `BIBLE_BOOKS` calling `getChapter(lang, book, 1)`-style whole-book fetches for any book not yet in that language's `downloadStatus.booksComplete`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd frontend && npx vitest run src/lib/bibleOfflineDb.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/bibleOfflineDb.ts frontend/src/lib/bibleOfflineDb.test.ts frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat: add IndexedDB-backed offline Bible storage, search, and local personalization CRUD"
```

---

## Task 7: Sync service

**Files:**
- Create: `frontend/src/lib/bibleSync.ts`
- Test: `frontend/src/lib/bibleSync.test.ts`

**Interfaces:**
- Consumes: `getUnsyncedRecords`/`markSynced` from Task 6; the `/api/bible-reading/*` routes from Task 5; `getAuthToken` pattern from `frontend/src/services/api.ts` (reuse `localStorage.getItem('token')` the same way).
- Produces: `syncBibleReadingData(): Promise<void>` — no-ops immediately if there's no auth token; otherwise, for every unsynced bookmark/highlight/note/position record, `PUT`s it to the matching route from Task 5 and calls `markSynced` on success, leaving it unsynced (to retry later) on network failure. Exported for the app to call on load and on `window.addEventListener('online', ...)`.

- [ ] **Step 1: Write the failing tests**

```ts
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { syncBibleReadingData } from './bibleSync';
import * as db from './bibleOfflineDb';

beforeEach(() => {
  localStorage.setItem('token', 'tok');
  vi.spyOn(db, 'getUnsyncedRecords').mockResolvedValue({
    bookmarks: [{ lang: 'en', book: 1, chapter: 1, verse: 1 }],
    highlights: [], notes: [], position: null
  });
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd frontend && npx vitest run src/lib/bibleSync.test.ts`
Expected: FAIL with "Cannot find module './bibleSync'"

- [ ] **Step 3: Implement `syncBibleReadingData`**

Read the API base URL the same way `frontend/src/services/api.ts` does (`import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`). For each record kind, loop and `fetch` with the `Authorization: Bearer <token>` header, matching Task 5's routes; on `res.ok`, call `markSynced(kind, key)` where `key` is the same `${lang}-${book}-${chapter}-${verse}` format Task 6 uses (`${lang}-${book}-${chapter}` for position, no verse).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd frontend && npx vitest run src/lib/bibleSync.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/bibleSync.ts frontend/src/lib/bibleSync.test.ts
git commit -m "feat: add last-write-wins sync of local Bible personalization data to the API"
```

---

## Task 8: Reader pages, routing, and navigation

**Files:**
- Create: `frontend/src/hooks/useBibleOffline.ts`
- Create: `frontend/src/pages/bible-reader/BibleHome.tsx`
- Create: `frontend/src/pages/bible-reader/BibleChapter.tsx`
- Create: `frontend/src/pages/bible-reader/BibleSearch.tsx`
- Modify: `frontend/src/App.tsx` (lazy imports + 3 routes)
- Modify: whichever file renders the main nav links (the same file `Verses`/`Donate`/`Contact` already appear in — locate it by searching for one of those nav labels; add a "Bible" entry pointing at the new `BibleHome` route)

**Interfaces:**
- Consumes: everything from Tasks 2, 6, 7 (`BIBLE_BOOKS`, `bibleOfflineDb` functions, `syncBibleReadingData`).
- Produces: `useBibleOffline()` — a thin hook wrapping `bibleOfflineDb` + `bibleSync` so the three pages below call hook methods instead of importing `bibleOfflineDb` directly (keeps the pages free of IndexedDB-specific error handling, matches this repo's existing `useBibleVerse`-style hook pattern).
- Routes: `/bible` (BibleHome: language switcher + book grid, grouped OT/NT using `BIBLE_BOOKS`), `/bible/:lang/:book/:chapter` (BibleChapter: verse list with bookmark/highlight/note controls per verse, prev/next chapter, calls `setReadingPosition` on mount and offers to resume `getReadingPosition()` from `BibleHome`), `/bible/search` (BibleSearch: text input + `searchVerses` results scoped to the current language, showing a "still downloading" notice when `getDownloadStatus(lang).complete` is false).

- [ ] **Step 1: Implement `useBibleOffline`**

A hook exposing the same function names as `bibleOfflineDb`/`bibleSync` (re-exported, optionally wrapped in `useCallback`), plus local `useState` for the current language (persisted to `localStorage.getItem/setItem('bibleLang')`, default `'en'`) and a `useEffect` that calls `startBackgroundFill(lang)` whenever `lang` changes, and calls `syncBibleReadingData()` once on mount and on the browser `online` event.

- [ ] **Step 2: Implement `BibleHome.tsx`, `BibleChapter.tsx`, `BibleSearch.tsx`**

Follow this repo's existing page conventions (see `frontend/src/pages/Verses.tsx` for layout/Tailwind/i18n patterns to match). `BibleChapter` reads `:lang/:book/:chapter` from `useParams`, calls `getChapter`; on `{ error: 'offline-miss' }` shows an inline "not available offline yet" message instead of a blank page. Per-verse controls call `setBookmark`/`deleteBookmark`/`setHighlight`/`deleteHighlight`/`setNote` from the hook and reflect current state from `getBookmarks`/`getHighlights`/`getNotes`.

- [ ] **Step 3: Wire routes into `frontend/src/App.tsx`**

Add three `lazy(() => import(...))` entries next to the existing ones (around line 57-74) and three `<Route>` entries next to the existing `/verses` routes (around line 164-166), each wrapped in `<Suspense fallback={null}>` like the other unskeletoned routes.

- [ ] **Step 4: Add a "Bible" nav entry**

Find the nav component rendering the existing top-level links (grep the codebase for the literal text of an existing nav label such as `"Donate"` or `"Contact"` to locate it) and add a `/bible` link alongside them, following that file's existing pattern for link items (icon, label, i18n key if the others use one).

- [ ] **Step 5: Manual verification**

Run: `cd frontend && npm run dev`, then in a browser: open `/bible`, confirm all 66 books render grouped by testament; open a book/chapter, confirm verses render and a bookmark toggle persists across a page reload; open `/bible/search`, confirm a search term returns matches; use browser devtools to go offline, reload, and confirm a previously-opened chapter still renders from cache.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/hooks/useBibleOffline.ts frontend/src/pages/bible-reader frontend/src/App.tsx <nav file>
git commit -m "feat: add offline Bible reader pages, routes, and navigation entry"
```

---

## Task 9: PWA install & offline app shell

**Files:**
- Modify: `frontend/vite.config.ts` (add `vite-plugin-pwa`)
- Modify: `frontend/src/main.tsx` (replace the unregister block with service worker registration)
- Modify: `frontend/public/manifest.json` (add a "Bible" shortcut, matching the existing "Prayer Wall"/"Donate" entries)
- Modify: `frontend/package.json` (add `vite-plugin-pwa` to `devDependencies`)

**Interfaces:**
- Consumes: the generated `frontend/public/bible-data/**` from Task 3 (must exist before `vite-plugin-pwa`'s build-time globbing can precache it).
- Produces: a build that registers a Workbox service worker precaching the app shell and all `bible-data/**/*.json` files, replacing the old unregister-only behavior in `main.tsx`.

- [ ] **Step 1: Install and configure `vite-plugin-pwa`**

Run `npm install -D vite-plugin-pwa` in `frontend/`. In `vite.config.ts`, add to `plugins`:

```ts
import { VitePWA } from 'vite-plugin-pwa';
// ...
VitePWA({
  manifest: false, // keep the existing static public/manifest.json as-is
  registerType: 'autoUpdate',
  workbox: {
    cleanupOutdatedCaches: true,
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
  },
})
```

- [ ] **Step 2: Add a "Bible" shortcut to `manifest.json`**

Add `{ "name": "Bible", "url": "/bible" }` to the existing `shortcuts` array, alongside "Prayer Wall" and "Donate".

- [ ] **Step 3: Replace the service-worker-unregister block in `main.tsx`**

Remove the `if ('serviceWorker' in navigator) { ... registrations.forEach(unregister) ... }` block (it exists specifically to clear out the old, unversioned service worker — no longer needed once a correctly-versioned one replaces it) and replace it with:

```ts
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });
```

- [ ] **Step 4: Build and verify precaching**

Run: `cd frontend && npm run build && npm run preview`

In a browser, open the preview URL, open devtools → Application → Service Workers (confirm one is "activated and running") → Cache Storage (confirm a precache entry exists containing `bible-data/rw/1.json`, `bible-data/en/1.json`, and `bible-data/fr/1.json` — spot-check these three key names are present, confirming all three languages precached, not just the default).

- [ ] **Step 5: Verify offline-from-first-launch**

In the same browser tab, open devtools → Network → set to "Offline", then hard-reload the page. Expected: the app shell loads (not a browser offline error page), and navigating to `/bible/en/1/1`, `/bible/fr/1/1`, and `/bible/rw/1/1` each render chapter 1 verse text without needing network — confirming all three languages work offline immediately, with no prior online visit to those specific chapters required.

- [ ] **Step 6: Verify a redeploy doesn't strand returning visitors**

Make a trivial change to any already-built frontend file (e.g. a comment), run `npm run build` again, and reload the preview tab while online. Expected: the new service worker activates (devtools Application tab shows the updated one, old caches removed per `cleanupOutdatedCaches`), and the page loads the new build — not a stale cached chunk error (the exact failure this replaces the old hand-rolled service worker to avoid).

- [ ] **Step 7: Commit**

```bash
git add frontend/vite.config.ts frontend/src/main.tsx frontend/public/manifest.json frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat: add installable offline-first PWA service worker precaching app shell and all 3 Bible languages"
```

---

## Task 10: Final integration pass

**Files:**
- None new — this task is verification only, touching nothing unless a gap is found (in which case, fix in the file the gap belongs to and note it in the commit).

- [ ] **Step 1: Run the full test suite**

Run: `cd api && npx jest` and `cd frontend && npx vitest run`
Expected: all tests from Tasks 1, 2, 3, 5, 6, 7 pass.

- [ ] **Step 2: Confirm existing features are untouched**

Open `/verses` and the home page's featured-verse section; confirm both still render exactly as before (no shared files were modified outside the ones listed above).

- [ ] **Step 3: Confirm the three languages agree on structure**

Spot-check: `frontend/public/bible-data/rw/19.json` (Psalms, book 19), `en/19.json`, `fr/19.json` all have the same number of chapters (150) and, for chapter 1, the same verse count across all three languages (per the manifests from Task 3).

- [ ] **Step 4: Commit (only if Step 2 or 3 surfaced a fix)**

```bash
git add -A
git commit -m "fix: address integration gap found in final offline Bible reader review"
```
