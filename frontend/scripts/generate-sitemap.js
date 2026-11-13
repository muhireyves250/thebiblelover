import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.hema.rw';
const API_BASE = 'https://bible-project-api.onrender.com/api';

// Chapter count per book, in Bible order (Genesis..Revelation) - must stay
// in sync with RAW_BOOKS in src/data/bibleBooks.ts. Route is /bible/:lang/:book/:chapter
// where :book is the 1-based index into this list (BIBLE_BOOKS[i].number).
const CHAPTERS_PER_BOOK = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31,
  12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28,
  16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5,
  3, 5, 1, 1, 1, 22,
];
const BIBLE_LANGS = ['en', 'rw', 'fr'];

async function fetchJson(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`  could not fetch ${url}: ${err.message}`);
    return null;
  }
}

async function getAllBlogSlugs() {
  const data = await fetchJson(`${API_BASE}/blog?limit=200&page=1`);
  const posts = data?.data?.posts ?? [];
  return posts.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.updatedAt || p.publishedAt, priority: '0.7' }));
}

async function getAllVerseDetailUrls() {
  const data = await fetchJson(`${API_BASE}/bible-verses?limit=200&page=1`);
  const verses = data?.data?.verses ?? [];
  return verses.map((v) => ({ loc: `/verses/${v.id}`, lastmod: v.updatedAt, priority: '0.6' }));
}

async function getAllEventUrls() {
  const data = await fetchJson(`${API_BASE}/events`);
  const events = Array.isArray(data?.data) ? data.data : [];
  return events.map((e) => ({ loc: `/events/${e.id}`, lastmod: e.updatedAt || e.createdAt, priority: '0.6' }));
}

async function getAllAudioEpisodeUrls() {
  const data = await fetchJson(`${API_BASE}/audio-episodes?limit=200&page=1`);
  const episodes = data?.data?.episodes ?? [];
  return episodes.map((e) => ({ loc: `/players/${e.id}`, lastmod: e.updatedAt || e.createdAt, priority: '0.6' }));
}

async function getAllVideoUrls() {
  const data = await fetchJson(`${API_BASE}/home-feed/videos?limit=100`);
  const items = data?.data?.items ?? [];
  return items.map((v) => ({ loc: `/watch/${v.id}`, lastmod: v.publishedAt, priority: '0.6' }));
}

function getAllBibleChapterUrls() {
  const urls = [];
  CHAPTERS_PER_BOOK.forEach((chapterCount, index) => {
    const bookNumber = index + 1;
    for (const lang of BIBLE_LANGS) {
      for (let chapter = 1; chapter <= chapterCount; chapter++) {
        urls.push({ loc: `/bible/${lang}/${bookNumber}/${chapter}`, priority: '0.5', changefreq: 'yearly' });
      }
    }
  });
  return urls;
}

const STATIC_ROUTES = [
  { loc: '', priority: '1.0' },
  { loc: '/about', priority: '0.8' },
  { loc: '/bible', priority: '0.9' },
  { loc: '/bible/search', priority: '0.7' },
  { loc: '/verses', priority: '0.7' },
  { loc: '/posts', priority: '0.8' },
  { loc: '/players', priority: '0.7' },
  { loc: '/watch', priority: '0.7' },
  { loc: '/prayer-wall', priority: '0.6' },
  { loc: '/events', priority: '0.6' },
  { loc: '/donate', priority: '0.5' },
  { loc: '/contact', priority: '0.5' },
];

function toXmlEntry({ loc, lastmod, priority = '0.6', changefreq = 'monthly' }) {
  const safeLastmod = lastmod && !isNaN(new Date(lastmod).getTime()) ? new Date(lastmod).toISOString() : new Date().toISOString();
  return `
  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${safeLastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  console.log('Fetching dynamic content for sitemap...');
  const [blogUrls, verseUrls, eventUrls, audioUrls, videoUrls] = await Promise.all([
    getAllBlogSlugs(),
    getAllVerseDetailUrls(),
    getAllEventUrls(),
    getAllAudioEpisodeUrls(),
    getAllVideoUrls(),
  ]);
  const bibleChapterUrls = getAllBibleChapterUrls();

  const allEntries = [
    ...STATIC_ROUTES,
    ...blogUrls,
    ...verseUrls,
    ...eventUrls,
    ...audioUrls,
    ...videoUrls,
    ...bibleChapterUrls,
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allEntries.map(toXmlEntry).join('')}
</urlset>`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);

  console.log(`✅ Sitemap generated at: ${outputPath}`);
  console.log(`   static: ${STATIC_ROUTES.length}, blog: ${blogUrls.length}, verses: ${verseUrls.length}, events: ${eventUrls.length}, audio: ${audioUrls.length}, videos: ${videoUrls.length}, bible chapters: ${bibleChapterUrls.length}`);
  console.log(`   total URLs: ${allEntries.length}`);
}

main().catch((err) => {
  // Never fail the whole deploy over the sitemap - a stale/missing sitemap
  // is far better than a broken build because the API had a bad moment.
  console.error('⚠️  Sitemap generation failed, keeping previous sitemap.xml:', err);
});
