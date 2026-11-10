const express = require('express');
const { prisma } = require('../lib/prisma.js');
const { verifyToken } = require('../middleware/auth.js');

const router = express.Router();
router.use(verifyToken);

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    next(err);
  });
};

const VALID_LANGS = ['rw', 'en', 'fr'];

function parseVerseParams(req, res) {
  const { lang, book, chapter, verse } = req.params;
  if (!VALID_LANGS.includes(lang)) {
    res.status(400).json({ success: false, message: 'Invalid lang' });
    return null;
  }
  const parsed = { userId: req.user.id, lang, book: Number(book), chapter: Number(chapter), verse: Number(verse) };
  if (!Number.isInteger(parsed.book) || !Number.isInteger(parsed.chapter) || !Number.isInteger(parsed.verse)) {
    res.status(400).json({ success: false, message: 'book, chapter, and verse must be integers' });
    return null;
  }
  return parsed;
}

// Bookmarks
router.get('/bookmarks', asyncHandler(async (req, res) => {
  const bookmarks = await prisma.bibleBookmark.findMany({ where: { userId: req.user.id } });
  res.json({ bookmarks });
}));

router.put('/bookmarks/:lang/:book/:chapter/:verse', asyncHandler(async (req, res) => {
  const key = parseVerseParams(req, res);
  if (!key) return;
  const bookmark = await prisma.bibleBookmark.upsert({
    where: { userId_lang_book_chapter_verse: key },
    create: key,
    update: {},
  });
  res.json({ bookmark });
}));

router.delete('/bookmarks/:lang/:book/:chapter/:verse', asyncHandler(async (req, res) => {
  const key = parseVerseParams(req, res);
  if (!key) return;
  await prisma.bibleBookmark.delete({ where: { userId_lang_book_chapter_verse: key } });
  res.status(204).end();
}));

// Highlights
router.get('/highlights', asyncHandler(async (req, res) => {
  const highlights = await prisma.bibleHighlight.findMany({ where: { userId: req.user.id } });
  res.json({ highlights });
}));

router.put('/highlights/:lang/:book/:chapter/:verse', asyncHandler(async (req, res) => {
  const key = parseVerseParams(req, res);
  if (!key) return;
  if (typeof req.body.color !== 'string' || !req.body.color) {
    return res.status(400).json({ success: false, message: 'color is required' });
  }
  const highlight = await prisma.bibleHighlight.upsert({
    where: { userId_lang_book_chapter_verse: key },
    create: { ...key, color: req.body.color },
    update: { color: req.body.color },
  });
  res.json({ highlight });
}));

router.delete('/highlights/:lang/:book/:chapter/:verse', asyncHandler(async (req, res) => {
  const key = parseVerseParams(req, res);
  if (!key) return;
  await prisma.bibleHighlight.delete({ where: { userId_lang_book_chapter_verse: key } });
  res.status(204).end();
}));

// Notes
router.get('/notes', asyncHandler(async (req, res) => {
  const notes = await prisma.bibleNote.findMany({ where: { userId: req.user.id } });
  res.json({ notes });
}));

router.put('/notes/:lang/:book/:chapter/:verse', asyncHandler(async (req, res) => {
  const key = parseVerseParams(req, res);
  if (!key) return;
  if (typeof req.body.text !== 'string') {
    return res.status(400).json({ success: false, message: 'text is required' });
  }
  const note = await prisma.bibleNote.upsert({
    where: { userId_lang_book_chapter_verse: key },
    create: { ...key, text: req.body.text },
    update: { text: req.body.text },
  });
  res.json({ note });
}));

router.delete('/notes/:lang/:book/:chapter/:verse', asyncHandler(async (req, res) => {
  const key = parseVerseParams(req, res);
  if (!key) return;
  await prisma.bibleNote.delete({ where: { userId_lang_book_chapter_verse: key } });
  res.status(204).end();
}));

// Reading position
router.get('/position', asyncHandler(async (req, res) => {
  const position = await prisma.bibleReadingPosition.findUnique({ where: { userId: req.user.id } });
  res.json({ position: position ?? null });
}));

router.put('/position', asyncHandler(async (req, res) => {
  const { lang, book, chapter } = req.body;
  if (!VALID_LANGS.includes(lang) || !Number.isInteger(book) || !Number.isInteger(chapter)) {
    return res.status(400).json({ success: false, message: 'lang, book, and chapter are required' });
  }
  const position = await prisma.bibleReadingPosition.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id, lang, book, chapter },
    update: { lang, book, chapter },
  });
  res.json({ position });
}));

module.exports = router;
