import fetch from 'node-fetch';

// Thin wrapper around the YouTube Data API v3. Every call here costs quota
// (a channel's default is 10,000 units/day; a single `search.list` call
// costs 100 units on its own), so results are cached in memory with a
// short TTL rather than hitting YouTube on every request.

const API_BASE = 'https://www.googleapis.com/youtube/v3';

const cache = new Map(); // key -> { data, expiresAt }

function getCached(key) {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  return null;
}

function setCached(key, data, ttlMs) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function isConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID);
}

async function ytFetch(path, params) {
  const url = new URL(`${API_BASE}/${path}`);
  url.searchParams.set('key', process.env.YOUTUBE_API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`YouTube API ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

// The channel's "uploads" playlist ID rarely changes, so this is cached
// for a full day rather than re-fetched on every request.
async function getUploadsPlaylistId() {
  const cacheKey = `uploadsPlaylist:${process.env.YOUTUBE_CHANNEL_ID}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await ytFetch('channels', {
    part: 'contentDetails',
    id: process.env.YOUTUBE_CHANNEL_ID
  });

  const playlistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (playlistId) setCached(cacheKey, playlistId, 24 * 60 * 60 * 1000);
  return playlistId || null;
}

function mapPlaylistItem(item) {
  const videoId = item.snippet?.resourceId?.videoId;
  if (!videoId) return null;
  return {
    type: 'VIDEO',
    id: videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${videoId}`
  };
}

function mapLiveSearchItem(item) {
  const videoId = item.id?.videoId;
  if (!videoId) return null;
  return {
    type: 'LIVE',
    id: videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${videoId}`
  };
}

export async function getLatestVideos(maxResults = 8) {
  if (!isConfigured()) return [];

  const cacheKey = `latestVideos:${maxResults}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const playlistId = await getUploadsPlaylistId();
  if (!playlistId) return [];

  const data = await ytFetch('playlistItems', {
    part: 'snippet',
    playlistId,
    maxResults: String(maxResults)
  });

  const videos = (data.items || []).map(mapPlaylistItem).filter(Boolean);
  setCached(cacheKey, videos, 5 * 60 * 1000); // 5 minutes
  return videos;
}

export async function getLiveVideo() {
  if (!isConfigured()) return null;

  const cacheKey = 'liveVideo';
  const cached = getCached(cacheKey);
  if (cached !== null) return cached === 'NONE' ? null : cached;

  const data = await ytFetch('search', {
    part: 'snippet',
    channelId: process.env.YOUTUBE_CHANNEL_ID,
    eventType: 'live',
    type: 'video',
    maxResults: '1'
  });

  const live = (data.items || []).map(mapLiveSearchItem).find(Boolean) || null;
  setCached(cacheKey, live || 'NONE', 60 * 1000); // 1 minute — live status changes fast
  return live;
}

export const youtubeConfigured = isConfigured;
