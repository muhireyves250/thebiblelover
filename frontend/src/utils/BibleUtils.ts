/**
 * Utility for parsing and identifying Bible verse references in text.
 */

export interface BibleBook {
  name: string;
  abbreviations: string[];
}

export const BIBLE_BOOKS: BibleBook[] = [
  { name: 'Genesis', abbreviations: ['Gen', 'Ge', 'Gn'] },
  { name: 'Exodus', abbreviations: ['Exo', 'Ex', 'Exod'] },
  { name: 'Leviticus', abbreviations: ['Lev', 'Le', 'Lv'] },
  { name: 'Numbers', abbreviations: ['Num', 'Nu', 'Nm', 'Nb'] },
  { name: 'Deuteronomy', abbreviations: ['Deut', 'De', 'Dt'] },
  { name: 'Joshua', abbreviations: ['Josh', 'Jos', 'Jsh'] },
  { name: 'Judges', abbreviations: ['Judg', 'Jdg', 'Jgs'] },
  { name: 'Ruth', abbreviations: ['Ruth', 'Rth', 'Ru'] },
  { name: '1 Samuel', abbreviations: ['1 Sam', '1 Sa', '1 Sm', '1S', 'I Sam', 'I Sa'] },
  { name: '2 Samuel', abbreviations: ['2 Sam', '2 Sa', '2 Sm', '2S', 'II Sam', 'II Sa'] },
  { name: '1 Kings', abbreviations: ['1 Kings', '1 Ki', '1K', 'I Kings', 'I Ki'] },
  { name: '2 Kings', abbreviations: ['2 Kings', '2 Ki', '2K', 'II Kings', 'II Ki'] },
  { name: '1 Chronicles', abbreviations: ['1 Chron', '1 Ch', '1Ch', 'I Chron', 'I Ch'] },
  { name: '2 Chronicles', abbreviations: ['2 Chron', '2 Ch', '2Ch', 'II Chron', 'II Ch'] },
  { name: 'Ezra', abbreviations: ['Ezra', 'Ezr', 'Ez'] },
  { name: 'Nehemiah', abbreviations: ['Neh', 'Ne'] },
  { name: 'Esther', abbreviations: ['Esth', 'Est', 'Es'] },
  { name: 'Job', abbreviations: ['Job', 'Jb'] },
  { name: 'Psalms', abbreviations: ['Ps', 'Psalm', 'Pslm', 'Psa', 'Pss'] },
  { name: 'Proverbs', abbreviations: ['Prov', 'Pr', 'Prv'] },
  { name: 'Ecclesiastes', abbreviations: ['Eccles', 'Ecc', 'Ec'] },
  { name: 'Song of Solomon', abbreviations: ['Song of Sol', 'Song', 'Sos', 'Canticles', 'Cant'] },
  { name: 'Isaiah', abbreviations: ['Isa', 'Is'] },
  { name: 'Jeremiah', abbreviations: ['Jer', 'Je', 'Jr'] },
  { name: 'Lamentations', abbreviations: ['Lam', 'La'] },
  { name: 'Ezekiel', abbreviations: ['Ezek', 'Eze', 'Ezk'] },
  { name: 'Daniel', abbreviations: ['Dan', 'Da', 'Dn'] },
  { name: 'Hosea', abbreviations: ['Hos', 'Ho'] },
  { name: 'Joel', abbreviations: ['Joel', 'Joe', 'Jl'] },
  { name: 'Amos', abbreviations: ['Amos', 'Am'] },
  { name: 'Obadiah', abbreviations: ['Obad', 'Ob'] },
  { name: 'Jonah', abbreviations: ['Jonah', 'Jon'] },
  { name: 'Micah', abbreviations: ['Micah', 'Mic'] },
  { name: 'Nahum', abbreviations: ['Nahum', 'Nah', 'Na'] },
  { name: 'Habakkuk', abbreviations: ['Hab', 'Hb'] },
  { name: 'Zephaniah', abbreviations: ['Zeph', 'Zep', 'Zp'] },
  { name: 'Haggai', abbreviations: ['Haggai', 'Hag', 'Hg'] },
  { name: 'Zechariah', abbreviations: ['Zech', 'Zec', 'Zc'] },
  { name: 'Malachi', abbreviations: ['Mal', 'Mlc', 'Ml'] },
  { name: 'Matthew', abbreviations: ['Matt', 'Mt'] },
  { name: 'Mark', abbreviations: ['Mark', 'Mk', 'Mrk'] },
  { name: 'Luke', abbreviations: ['Luke', 'Lk', 'Luk'] },
  { name: 'John', abbreviations: ['John', 'Jn', 'Jhn'] },
  { name: 'Acts', abbreviations: ['Acts', 'Ac'] },
  { name: 'Romans', abbreviations: ['Rom', 'Ro', 'Rm'] },
  { name: '1 Corinthians', abbreviations: ['1 Cor', '1 Co', '1C', 'I Cor', 'I Co'] },
  { name: '2 Corinthians', abbreviations: ['2 Cor', '2 Co', '2C', 'II Cor', 'II Co'] },
  { name: 'Galatians', abbreviations: ['Gal', 'Ga'] },
  { name: 'Ephesians', abbreviations: ['Eph', 'Ep'] },
  { name: 'Philippians', abbreviations: ['Phil', 'Php'] },
  { name: 'Colossians', abbreviations: ['Col', 'Co'] },
  { name: '1 Thessalonians', abbreviations: ['1 Thess', '1 Th', '1Ts', 'I Thess', 'I Th'] },
  { name: '2 Thessalonians', abbreviations: ['2 Thess', '2 Th', '2Ts', 'II Thess', 'II Th'] },
  { name: '1 Timothy', abbreviations: ['1 Tim', '1 Ti', '1T', 'I Tim', 'I Ti'] },
  { name: '2 Timothy', abbreviations: ['2 Tim', '2 Ti', '2T', 'II Tim', 'II Ti'] },
  { name: 'Titus', abbreviations: ['Titus', 'Tit', 'Ti'] },
  { name: 'Philemon', abbreviations: ['Philem', 'Phm', 'Pm'] },
  { name: 'Hebrews', abbreviations: ['Heb', 'He'] },
  { name: 'James', abbreviations: ['James', 'Jas', 'Jm'] },
  { name: '1 Peter', abbreviations: ['1 Pet', '1 Pe', '1Pt', 'I Pet', 'I Pe'] },
  { name: '2 Peter', abbreviations: ['2 Pet', '2 Pe', '2Pt', 'II Pet', 'II Pe'] },
  { name: '1 John', abbreviations: ['1 John', '1 Jn', '1J', 'I John', 'I Jn'] },
  { name: '2 John', abbreviations: ['2 John', '2 Jn', '2J', 'II John', 'II Jn'] },
  { name: '3 John', abbreviations: ['3 John', '3 Jn', '3J', 'III John', 'III Jn'] },
  { name: 'Jude', abbreviations: ['Jude', 'Jud', 'Jd'] },
  { name: 'Revelation', abbreviations: ['Rev', 'Re', 'Rv'] },
];

/**
 * Regex components
 */
const bookNames = BIBLE_BOOKS.flatMap(b => [b.name, ...b.abbreviations])
  .sort((a, b) => b.length - a.length) // Longest first for regex matching
  .map(name => name.replace('.', '\\.')) // Escape dots
  .join('|');

// Pattern: Book Chapter:Verse(-Verse)?
// e.g., John 3:16, 1 Cor 13:4-7, Genesis 1:1
export const BIBLE_VERSE_REGEX = new RegExp(`\\b(${bookNames})\\s+(\\d+):(\\d+)(?:-(\\d+))?\\b`, 'gi');

/**
 * Normalizes a detected book name to its standard full name.
 */
export const normalizeBookName = (foundName: string): string => {
  const lowerName = foundName.toLowerCase().replace(/\s/g, '');
  const book = BIBLE_BOOKS.find(b => 
    b.name.toLowerCase().replace(/\s/g, '') === lowerName || 
    b.abbreviations.some(abbr => abbr.toLowerCase().replace(/\s/g, '') === lowerName)
  );
  return book ? book.name : foundName;
};

/**
 * Generates a link to an external Bible tool or internal search.
 */
export const getVerseLink = (book: string, chapter: number, verse: number, endVerse?: number) => {
  const normalizedBook = normalizeBookName(book);
  const ref = `${normalizedBook} ${chapter}:${verse}${endVerse ? `-${endVerse}` : ''}`;
  // Using Bible Gateway as a default external reference
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=NIV`;
};
