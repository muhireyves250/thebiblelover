const { buildManifest } = require('./import-bible');

test('buildManifest counts chapters and verses per book', () => {
  const books = [
    { number: 1, name: 'Itangiriro', chapters: [
      { number: 1, verses: ['a', 'b'] },
      { number: 2, verses: ['c'] }
    ] }
  ];
  expect(buildManifest(books)).toEqual({
    '1': { chapters: 2, versesPerChapter: [2, 1] }
  });
});
