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
