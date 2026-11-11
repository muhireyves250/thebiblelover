import { next } from '@vercel/edge';
import { BIBLE_BOOKS } from './src/data/bibleBooks';
import { bibleChapterSeoDescription } from './src/lib/bibleChapterSeo';
import type { Lang } from './src/lib/bibleOfflineDb';

// Link-preview bots (WhatsApp, Facebook, Twitter/X, Telegram, LinkedIn,
// Slack, Discord) never execute JavaScript - they fetch the raw HTML and
// read whatever <meta> tags are already there. This app sets its
// per-page title/description/image with client-side JS (react-helmet),
// which those bots never see; every shared link would otherwise show
// the same generic index.html card regardless of what was actually
// shared. This middleware intercepts just those bots, for just the
// routes that have their own content, and serves a tiny pre-rendered
// HTML document with the real metadata for that exact page instead.
// Everyone else (real browsers, search engine crawlers that do run JS)
// is unaffected and gets the normal app.

const BOT_USER_AGENT = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Discordbot|SkypeUriPreview|Pinterest|redditbot|vkShare|Applebot/i;

const CANONICAL_ORIGIN = 'https://www.hema.rw';
const API_BASE = 'https://bible-project-api.onrender.com/api';
const DEFAULT_IMAGE = `${CANONICAL_ORIGIN}/og-image.jpg`;
const SITE_NAME = 'The Bible Lover';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMetaHtml(input: { title: string; description: string; image: string; url: string; type?: 'website' | 'article' }) {
  const title = escapeHtml(input.title);
  const description = escapeHtml(input.description);
  const image = escapeHtml(input.image);
  const url = escapeHtml(input.url);
  const type = input.type ?? 'website';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="${type}" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body>
<a href="${url}">${title}</a>
</body>
</html>`;

  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

async function fetchJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function handleBibleChapter(url: URL, lang: string, bookParam: string, chapterParam: string) {
  if (lang !== 'rw' && lang !== 'en' && lang !== 'fr') return null;
  const book = Number(bookParam);
  const chapter = Number(chapterParam);
  const bookMeta = BIBLE_BOOKS.find((b) => b.number === book);
  if (!bookMeta || !Number.isInteger(chapter) || chapter < 1 || chapter > bookMeta.chapterCount) return null;

  const name = bookMeta.names[lang as Lang];
  return renderMetaHtml({
    title: `${name} ${chapter}`,
    description: bibleChapterSeoDescription(lang as Lang, name, chapter),
    image: DEFAULT_IMAGE,
    url: url.toString(),
  });
}

async function handleVerse(url: URL, id: string) {
  const data = await fetchJson(`${API_BASE}/bible-verses/${id}`);
  const verse = data?.data?.verse;
  if (!verse) return null;
  return renderMetaHtml({
    title: `${verse.book} ${verse.chapter}:${verse.verse}`,
    description: verse.text,
    image: verse.image || DEFAULT_IMAGE,
    url: url.toString(),
    type: 'article',
  });
}

async function handleBlogPost(url: URL, slug: string) {
  const data = await fetchJson(`${API_BASE}/blog/${slug}`);
  const post = data?.data?.post;
  if (!post) return null;
  return renderMetaHtml({
    title: post.title,
    description: post.excerpt,
    image: post.featuredImage || DEFAULT_IMAGE,
    url: url.toString(),
    type: 'article',
  });
}

async function handleAudioEpisode(url: URL, id: string) {
  const data = await fetchJson(`${API_BASE}/audio-episodes/${id}`);
  const episode = data?.data?.episode;
  if (!episode) return null;
  return renderMetaHtml({
    title: episode.title,
    description: episode.description,
    image: episode.coverImage || DEFAULT_IMAGE,
    url: url.toString(),
    type: 'article',
  });
}

async function handleEvent(url: URL, id: string) {
  const data = await fetchJson(`${API_BASE}/events/${id}`);
  const event = data?.data?.event;
  if (!event) return null;
  return renderMetaHtml({
    title: event.title,
    description: event.description,
    image: event.thumbnail || DEFAULT_IMAGE,
    url: url.toString(),
    type: 'article',
  });
}

async function handleVideo(url: URL, id: string) {
  const data = await fetchJson(`${API_BASE}/home-feed/videos?limit=50`);
  const items: any[] = data?.data?.items ?? [];
  const video = items.find((item) => item.id === id);
  if (!video) return null;
  return renderMetaHtml({
    title: video.title,
    description: video.excerpt || `Watch ${video.title} from ${SITE_NAME}.`,
    image: video.thumbnail || DEFAULT_IMAGE,
    url: url.toString(),
    type: 'article',
  });
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!BOT_USER_AGENT.test(userAgent)) return next();

  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);

  try {
    let response: Response | null = null;

    if (segments[0] === 'bible' && segments.length === 4) {
      response = await handleBibleChapter(url, segments[1], segments[2], segments[3]);
    } else if (segments[0] === 'verses' && segments.length === 2) {
      response = await handleVerse(url, segments[1]);
    } else if (segments[0] === 'blog' && segments.length === 2) {
      response = await handleBlogPost(url, segments[1]);
    } else if (segments[0] === 'players' && segments.length === 2) {
      response = await handleAudioEpisode(url, segments[1]);
    } else if (segments[0] === 'events' && segments.length === 2) {
      response = await handleEvent(url, segments[1]);
    } else if (segments[0] === 'watch' && segments.length === 2) {
      response = await handleVideo(url, segments[1]);
    }

    if (response) return response;
  } catch {
    // Fall through to the normal app on any unexpected error - a broken
    // preview is far better than a broken site.
  }

  return next();
}

export const config = {
  matcher: [
    '/bible/:lang/:book/:chapter',
    '/verses/:id',
    '/blog/:slug',
    '/players/:id',
    '/events/:id',
    '/watch/:id',
  ],
};
