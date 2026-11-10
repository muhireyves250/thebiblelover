import React from 'react';
import { Link } from 'react-router-dom';
import { BIBLE_BOOKS, type BibleBookMeta } from '../../data/bibleBooks';
import type { Lang } from '../../lib/bibleOfflineDb';

type Props = {
  lang: Lang;
  currentBook: number;
  currentChapter: number;
};

const BookRow: React.FC<{ book: BibleBookMeta; lang: Lang; currentBook: number; currentChapter: number }> = ({
  book, lang, currentBook, currentChapter,
}) => {
  const isCurrent = book.number === currentBook;

  if (!isCurrent) {
    return (
      <Link
        to={`/bible/${lang}/${book.number}/1`}
        className="block px-2 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
      >
        {book.names[lang]}
      </Link>
    );
  }

  return (
    <div className="px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/10">
      <div className="text-sm font-bold text-amber-700 mb-1.5">{book.names[lang]}</div>
      <div className="grid grid-cols-6 gap-1">
        {Array.from({ length: book.chapterCount }, (_, i) => i + 1).map((chapterNumber) => (
          <Link
            key={chapterNumber}
            to={`/bible/${lang}/${book.number}/${chapterNumber}`}
            className={`h-6 flex items-center justify-center rounded text-[11px] transition-colors ${
              chapterNumber === currentChapter
                ? 'bg-amber-700 text-white font-bold'
                : 'bg-white dark:bg-[#141417] text-gray-600 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/20'
            }`}
          >
            {chapterNumber}
          </Link>
        ))}
      </div>
    </div>
  );
};

const BibleSidebar: React.FC<Props> = ({ lang, currentBook, currentChapter }) => {
  const oldTestament = BIBLE_BOOKS.filter((b) => b.testament === 'OT');
  const newTestament = BIBLE_BOOKS.filter((b) => b.testament === 'NT');

  return (
    <aside className="w-56 shrink-0 overflow-y-auto max-h-[calc(100vh-6rem)] pr-2">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 mb-1.5">Old Testament</h3>
      <div className="space-y-0.5 mb-4">
        {oldTestament.map((book) => (
          <BookRow key={book.number} book={book} lang={lang} currentBook={currentBook} currentChapter={currentChapter} />
        ))}
      </div>

      <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 mb-1.5">New Testament</h3>
      <div className="space-y-0.5">
        {newTestament.map((book) => (
          <BookRow key={book.number} book={book} lang={lang} currentBook={currentBook} currentChapter={currentChapter} />
        ))}
      </div>
    </aside>
  );
};

export default BibleSidebar;
