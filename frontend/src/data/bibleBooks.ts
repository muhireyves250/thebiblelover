export type BibleBookMeta = {
  number: number;
  slug: string;
  testament: 'OT' | 'NT';
  chapterCount: number;
  names: { rw: string; en: string; fr: string };
};

const slugify = (en: string) => en.toLowerCase().replace(/\s+/g, '-');

type RawBook = { en: string; fr: string; rw: string; chapters: number; testament: 'OT' | 'NT' };

const RAW_BOOKS: RawBook[] = [
  { en: 'Genesis', fr: 'Genèse', rw: 'Itangiriro', chapters: 50, testament: 'OT' },
  { en: 'Exodus', fr: 'Exode', rw: 'Kuva', chapters: 40, testament: 'OT' },
  { en: 'Leviticus', fr: 'Lévitique', rw: 'Abalewi', chapters: 27, testament: 'OT' },
  { en: 'Numbers', fr: 'Nombres', rw: 'Kubara', chapters: 36, testament: 'OT' },
  { en: 'Deuteronomy', fr: 'Deutéronome', rw: 'Gutegeka kwa Kabiri', chapters: 34, testament: 'OT' },
  { en: 'Joshua', fr: 'Josué', rw: 'Yosuwa', chapters: 24, testament: 'OT' },
  { en: 'Judges', fr: 'Juges', rw: 'Abacamanza', chapters: 21, testament: 'OT' },
  { en: 'Ruth', fr: 'Ruth', rw: 'Rusi', chapters: 4, testament: 'OT' },
  { en: '1 Samuel', fr: '1 Samuel', rw: '1 Samweli', chapters: 31, testament: 'OT' },
  { en: '2 Samuel', fr: '2 Samuel', rw: '2 Samweli', chapters: 24, testament: 'OT' },
  { en: '1 Kings', fr: '1 Rois', rw: '1 Abami', chapters: 22, testament: 'OT' },
  { en: '2 Kings', fr: '2 Rois', rw: '2 Abami', chapters: 25, testament: 'OT' },
  { en: '1 Chronicles', fr: '1 Chroniques', rw: '1 Ngoma', chapters: 29, testament: 'OT' },
  { en: '2 Chronicles', fr: '2 Chroniques', rw: '2 Ngoma', chapters: 36, testament: 'OT' },
  { en: 'Ezra', fr: 'Esdras', rw: 'Ezira', chapters: 10, testament: 'OT' },
  { en: 'Nehemiah', fr: 'Néhémie', rw: 'Nehemiya', chapters: 13, testament: 'OT' },
  { en: 'Esther', fr: 'Esther', rw: 'Esiteri', chapters: 10, testament: 'OT' },
  { en: 'Job', fr: 'Job', rw: 'Yobu', chapters: 42, testament: 'OT' },
  { en: 'Psalms', fr: 'Psaumes', rw: 'Zaburi', chapters: 150, testament: 'OT' },
  { en: 'Proverbs', fr: 'Proverbes', rw: 'Imigani', chapters: 31, testament: 'OT' },
  { en: 'Ecclesiastes', fr: 'Ecclésiaste', rw: 'Umubwiriza', chapters: 12, testament: 'OT' },
  { en: 'Song of Solomon', fr: 'Cantique des Cantiques', rw: 'Indirimbo Ya Salomo', chapters: 8, testament: 'OT' },
  { en: 'Isaiah', fr: 'Ésaïe', rw: 'Yesaya', chapters: 66, testament: 'OT' },
  { en: 'Jeremiah', fr: 'Jérémie', rw: 'Yeremiya', chapters: 52, testament: 'OT' },
  { en: 'Lamentations', fr: 'Lamentations', rw: 'Amaganya Ya Yeremiya', chapters: 5, testament: 'OT' },
  { en: 'Ezekiel', fr: 'Ézéchiel', rw: 'Ezekeiyeli', chapters: 48, testament: 'OT' },
  { en: 'Daniel', fr: 'Daniel', rw: 'Daniyeli', chapters: 12, testament: 'OT' },
  { en: 'Hosea', fr: 'Osée', rw: 'Hoseya', chapters: 14, testament: 'OT' },
  { en: 'Joel', fr: 'Joël', rw: 'Yoweli', chapters: 3, testament: 'OT' },
  { en: 'Amos', fr: 'Amos', rw: 'Amosi', chapters: 9, testament: 'OT' },
  { en: 'Obadiah', fr: 'Abdias', rw: 'Obadiya', chapters: 1, testament: 'OT' },
  { en: 'Jonah', fr: 'Jonas', rw: 'Yona', chapters: 4, testament: 'OT' },
  { en: 'Micah', fr: 'Michée', rw: 'Mika', chapters: 7, testament: 'OT' },
  { en: 'Nahum', fr: 'Nahum', rw: 'Nahumu', chapters: 3, testament: 'OT' },
  { en: 'Habakkuk', fr: 'Habacuc', rw: 'Habakuki', chapters: 3, testament: 'OT' },
  { en: 'Zephaniah', fr: 'Sophonie', rw: 'Zefaniya', chapters: 3, testament: 'OT' },
  { en: 'Haggai', fr: 'Aggée', rw: 'Hagayi', chapters: 2, testament: 'OT' },
  { en: 'Zechariah', fr: 'Zacharie', rw: 'Zekariya', chapters: 14, testament: 'OT' },
  { en: 'Malachi', fr: 'Malachie', rw: 'Malaki', chapters: 4, testament: 'OT' },
  { en: 'Matthew', fr: 'Matthieu', rw: 'Matayo', chapters: 28, testament: 'NT' },
  { en: 'Mark', fr: 'Marc', rw: 'Mariko', chapters: 16, testament: 'NT' },
  { en: 'Luke', fr: 'Luc', rw: 'Luka', chapters: 24, testament: 'NT' },
  { en: 'John', fr: 'Jean', rw: 'Yohana', chapters: 21, testament: 'NT' },
  { en: 'Acts', fr: 'Actes', rw: "Ibyakozwe n'Intumwa", chapters: 28, testament: 'NT' },
  { en: 'Romans', fr: 'Romains', rw: 'Abaroma', chapters: 16, testament: 'NT' },
  { en: '1 Corinthians', fr: '1 Corinthiens', rw: '1 Abakorinto', chapters: 16, testament: 'NT' },
  { en: '2 Corinthians', fr: '2 Corinthiens', rw: '2 Abakorinto', chapters: 13, testament: 'NT' },
  { en: 'Galatians', fr: 'Galates', rw: 'Abagalatiya', chapters: 6, testament: 'NT' },
  { en: 'Ephesians', fr: 'Éphésiens', rw: 'Abefeso', chapters: 6, testament: 'NT' },
  { en: 'Philippians', fr: 'Philippiens', rw: 'Abafilipi', chapters: 4, testament: 'NT' },
  { en: 'Colossians', fr: 'Colossiens', rw: 'Abakolosayi', chapters: 4, testament: 'NT' },
  { en: '1 Thessalonians', fr: '1 Thessaloniciens', rw: '1 Abatesalonike', chapters: 5, testament: 'NT' },
  { en: '2 Thessalonians', fr: '2 Thessaloniciens', rw: '2 Abatesalonike', chapters: 3, testament: 'NT' },
  { en: '1 Timothy', fr: '1 Timothée', rw: '1 Timoteyo', chapters: 6, testament: 'NT' },
  { en: '2 Timothy', fr: '2 Timothée', rw: '2 Timoteyo', chapters: 4, testament: 'NT' },
  { en: 'Titus', fr: 'Tite', rw: 'Tito', chapters: 3, testament: 'NT' },
  { en: 'Philemon', fr: 'Philémon', rw: 'Filemoni', chapters: 1, testament: 'NT' },
  { en: 'Hebrews', fr: 'Hébreux', rw: 'Abaheburayo', chapters: 13, testament: 'NT' },
  { en: 'James', fr: 'Jacques', rw: 'Yakobo', chapters: 5, testament: 'NT' },
  { en: '1 Peter', fr: '1 Pierre', rw: '1 Petero', chapters: 5, testament: 'NT' },
  { en: '2 Peter', fr: '2 Pierre', rw: '2 Petero', chapters: 3, testament: 'NT' },
  { en: '1 John', fr: '1 Jean', rw: '1 Yohana', chapters: 5, testament: 'NT' },
  { en: '2 John', fr: '2 Jean', rw: '2 Yohana', chapters: 1, testament: 'NT' },
  { en: '3 John', fr: '3 Jean', rw: '3 Yohana', chapters: 1, testament: 'NT' },
  { en: 'Jude', fr: 'Jude', rw: 'Yuda', chapters: 1, testament: 'NT' },
  { en: 'Revelation', fr: 'Apocalypse', rw: 'Ibyahisuwe', chapters: 22, testament: 'NT' },
];

export const BIBLE_BOOKS: BibleBookMeta[] = RAW_BOOKS.map((book, index) => ({
  number: index + 1,
  slug: slugify(book.en),
  testament: book.testament,
  chapterCount: book.chapters,
  names: { rw: book.rw, en: book.en, fr: book.fr },
}));
