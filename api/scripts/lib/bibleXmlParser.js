const { XMLParser } = require('fast-xml-parser');

const ARRAY_TAGS = new Set(['BIBLEBOOK', 'CHAPTER', 'VERS', 'book', 'chapter', 'verse']);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name) => ARRAY_TAGS.has(name),
});

const cleanText = (text) => String(text).trim().replace(/\s+/g, ' ');

// Indexes by the verse's own number (not array position) and fills any
// gap with '' - a source file can skip a verse number (e.g. Job 21:8 is
// absent from the Kinyarwanda source), and every later verse in that
// chapter would otherwise shift down by one.
function versesByNumber(rawVerses, numberField) {
  const verses = [];
  for (const raw of rawVerses) {
    const number = Number(raw[numberField]);
    verses[number - 1] = cleanText(raw['#text'] ?? raw);
  }
  for (let i = 0; i < verses.length; i++) {
    if (verses[i] === undefined) verses[i] = '';
  }
  return verses;
}

function parseBibleXml(xml, schema) {
  const doc = parser.parse(xml);

  if (schema === 'named') {
    const rawBooks = doc.XMLBIBLE.BIBLEBOOK;
    return rawBooks.map((book) => ({
      number: Number(book.bnumber),
      name: book.bname,
      chapters: book.CHAPTER.map((chapter) => ({
        number: Number(chapter.cnumber),
        verses: versesByNumber(chapter.VERS, 'vnumber'),
      })),
    }));
  }

  const testaments = Array.isArray(doc.bible.testament) ? doc.bible.testament : [doc.bible.testament];
  const rawBooks = [].concat(...testaments.map((testament) => testament.book));
  return rawBooks.map((book) => ({
    number: Number(book.number),
    name: null,
    chapters: book.chapter.map((chapter) => ({
      number: Number(chapter.number),
      verses: versesByNumber(chapter.verse, 'number'),
    })),
  }));
}

module.exports = { parseBibleXml };
