import { describe, it, expect } from 'vitest';
import { BIBLE_BOOKS } from './bibleBooks';

describe('BIBLE_BOOKS', () => {
  it('has exactly 66 books numbered 1-66 with no gaps or duplicates', () => {
    const numbers = BIBLE_BOOKS.map(b => b.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 66 }, (_, i) => i + 1));
  });

  it('has 39 Old Testament and 27 New Testament books', () => {
    expect(BIBLE_BOOKS.filter(b => b.testament === 'OT')).toHaveLength(39);
    expect(BIBLE_BOOKS.filter(b => b.testament === 'NT')).toHaveLength(27);
  });

  it('gives every book a name in all three languages and a positive chapter count', () => {
    for (const book of BIBLE_BOOKS) {
      expect(book.names.rw.length).toBeGreaterThan(0);
      expect(book.names.en.length).toBeGreaterThan(0);
      expect(book.names.fr.length).toBeGreaterThan(0);
      expect(book.chapterCount).toBeGreaterThan(0);
    }
  });

  it('book 1 is Genesis/Itangiriro/Genèse with 50 chapters, book 66 is Revelation with 22 chapters', () => {
    const genesis = BIBLE_BOOKS.find(b => b.number === 1)!;
    const revelation = BIBLE_BOOKS.find(b => b.number === 66)!;
    expect(genesis.names).toEqual({ rw: 'Itangiriro', en: 'Genesis', fr: 'Genèse' });
    expect(genesis.chapterCount).toBe(50);
    expect(revelation.chapterCount).toBe(22);
  });
});
