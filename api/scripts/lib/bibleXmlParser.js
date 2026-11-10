const { XMLParser } = require('fast-xml-parser');

const ARRAY_TAGS = new Set(['BIBLEBOOK', 'CHAPTER', 'VERS', 'book', 'chapter', 'verse']);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name) => ARRAY_TAGS.has(name),
});

const cleanText = (text) => String(text).trim().replace(/\s+/g, ' ');

function parseBibleXml(xml, schema) {
  const doc = parser.parse(xml);

  if (schema === 'named') {
    const rawBooks = doc.XMLBIBLE.BIBLEBOOK;
    return rawBooks.map((book) => ({
      number: Number(book.bnumber),
      name: book.bname,
      chapters: book.CHAPTER.map((chapter) => ({
        number: Number(chapter.cnumber),
        verses: chapter.VERS.map((verse) => cleanText(verse['#text'] ?? verse)),
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
      verses: chapter.verse.map((verse) => cleanText(verse['#text'] ?? verse)),
    })),
  }));
}

module.exports = { parseBibleXml };
