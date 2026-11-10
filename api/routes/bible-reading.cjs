const express = require('express');
const { prisma } = require('../lib/prisma.js');
const { verifyToken } = require('../middleware/auth.js');

const router = express.Router();
router.use(verifyToken);

const verseKey = (req) => ({
  userId: req.user.id,
  lang: req.params.lang,
  book: Number(req.params.book),
  chapter: Number(req.params.chapter),
  verse: Number(req.params.verse),
});

// Bookmarks
router.get('/bookmarks', async (req, res) => {
  const bookmarks = await prisma.bibleBookmark.findMany({ where: { userId: req.user.id } });
  res.json({ bookmarks });
});

router.put('/bookmarks/:lang/:book/:chapter/:verse', async (req, res) => {
  const key = verseKey(req);
  const bookmark = await prisma.bibleBookmark.upsert({
    where: { userId_lang_book_chapter_verse: key },
    create: key,
    update: {},
  });
  res.json({ bookmark });
});

router.delete('/bookmarks/:lang/:book/:chapter/:verse', async (req, res) => {
  await prisma.bibleBookmark.delete({ where: { userId_lang_book_chapter_verse: verseKey(req) } });
  res.status(204).end();
});

// Highlights
router.get('/highlights', async (req, res) => {
  const highlights = await prisma.bibleHighlight.findMany({ where: { userId: req.user.id } });
  res.json({ highlights });
});

router.put('/highlights/:lang/:book/:chapter/:verse', async (req, res) => {
  const key = verseKey(req);
  const highlight = await prisma.bibleHighlight.upsert({
    where: { userId_lang_book_chapter_verse: key },
    create: { ...key, color: req.body.color },
    update: { color: req.body.color },
  });
  res.json({ highlight });
});

router.delete('/highlights/:lang/:book/:chapter/:verse', async (req, res) => {
  await prisma.bibleHighlight.delete({ where: { userId_lang_book_chapter_verse: verseKey(req) } });
  res.status(204).end();
});

// Notes
router.get('/notes', async (req, res) => {
  const notes = await prisma.bibleNote.findMany({ where: { userId: req.user.id } });
  res.json({ notes });
});

router.put('/notes/:lang/:book/:chapter/:verse', async (req, res) => {
  const key = verseKey(req);
  const note = await prisma.bibleNote.upsert({
    where: { userId_lang_book_chapter_verse: key },
    create: { ...key, text: req.body.text },
    update: { text: req.body.text },
  });
  res.json({ note });
});

router.delete('/notes/:lang/:book/:chapter/:verse', async (req, res) => {
  await prisma.bibleNote.delete({ where: { userId_lang_book_chapter_verse: verseKey(req) } });
  res.status(204).end();
});

// Reading position
router.get('/position', async (req, res) => {
  const position = await prisma.bibleReadingPosition.findUnique({ where: { userId: req.user.id } });
  res.json({ position: position ?? null });
});

router.put('/position', async (req, res) => {
  const { lang, book, chapter } = req.body;
  const position = await prisma.bibleReadingPosition.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id, lang, book, chapter },
    update: { lang, book, chapter },
  });
  res.json({ position });
});

module.exports = router;
