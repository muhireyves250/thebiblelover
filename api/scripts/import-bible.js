const fs = require('fs');
const path = require('path');
const { parseBibleXml } = require('./lib/bibleXmlParser');

function buildManifest(books) {
  const manifest = {};
  for (const book of books) {
    manifest[String(book.number)] = {
      chapters: book.chapters.length,
      versesPerChapter: book.chapters.map((c) => c.verses.length),
    };
  }
  return manifest;
}

const LANGUAGES = [
  { lang: 'rw', file: 'rw.xml', schema: 'named' },
  { lang: 'en', file: 'en.xml', schema: 'numbered' },
  { lang: 'fr', file: 'fr.xml', schema: 'numbered' },
];

function run() {
  const sourceDir = path.join(__dirname, '..', 'bible-source');
  const outRoot = path.join(__dirname, '..', '..', 'frontend', 'public', 'bible-data');

  for (const { lang, file, schema } of LANGUAGES) {
    const xml = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    const books = parseBibleXml(xml, schema);

    const outDir = path.join(outRoot, lang);
    fs.mkdirSync(outDir, { recursive: true });

    for (const book of books) {
      const body = book.chapters.map((c) => c.verses);
      fs.writeFileSync(path.join(outDir, `${book.number}.json`), JSON.stringify(body));
    }

    fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(buildManifest(books)));
    console.log(`Wrote ${books.length} books for "${lang}" to ${outDir}`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { buildManifest, run };
