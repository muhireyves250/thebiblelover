jest.mock('../lib/prisma.js', () => ({
  prisma: {
    bibleBookmark: { findMany: jest.fn(), upsert: jest.fn(), delete: jest.fn() },
    bibleHighlight: { findMany: jest.fn(), upsert: jest.fn(), delete: jest.fn() },
    bibleNote: { findMany: jest.fn(), upsert: jest.fn(), delete: jest.fn() },
    bibleReadingPosition: { findUnique: jest.fn(), upsert: jest.fn() }
  }
}));
jest.mock('../middleware/auth.js', () => ({
  verifyToken: (req, res, next) => { req.user = { id: 'user-1' }; next(); }
}));

const request = require('supertest');
const express = require('express');
const { prisma } = require('../lib/prisma.js');
const bibleReadingRoutes = require('./bible-reading.cjs');

const app = express();
app.use(express.json());
app.use('/api/bible-reading', bibleReadingRoutes);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

beforeEach(() => {
  jest.clearAllMocks();
});

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

test('DELETE /bookmarks forwards a Prisma "not found" error as 404 instead of crashing', async () => {
  const err = new Error('Record not found'); err.code = 'P2025';
  prisma.bibleBookmark.delete.mockRejectedValue(err);
  const res = await request(app).delete('/api/bible-reading/bookmarks/en/1/1/999');
  expect(res.status).toBe(404);
});

test('PUT /bookmarks forwards an unexpected Prisma error via next(err) instead of crashing the process', async () => {
  prisma.bibleBookmark.upsert.mockRejectedValue(new Error('connection lost'));
  const res = await request(app).put('/api/bible-reading/bookmarks/en/1/1/1').send();
  expect(res.status).toBe(500);
});

test('PUT /bookmarks with a non-numeric chapter returns 400 instead of writing NaN', async () => {
  const res = await request(app).put('/api/bible-reading/bookmarks/en/1/abc/1').send();
  expect(res.status).toBe(400);
  expect(prisma.bibleBookmark.upsert).not.toHaveBeenCalled();
});
