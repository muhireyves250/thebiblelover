-- CreateTable
CREATE TABLE "bible_bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "book" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bible_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bible_highlights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "book" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bible_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bible_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "book" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bible_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bible_reading_position" (
    "userId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "book" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bible_reading_position_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "bible_bookmarks_userId_lang_book_chapter_verse_key" ON "bible_bookmarks"("userId", "lang", "book", "chapter", "verse");

-- CreateIndex
CREATE UNIQUE INDEX "bible_highlights_userId_lang_book_chapter_verse_key" ON "bible_highlights"("userId", "lang", "book", "chapter", "verse");

-- CreateIndex
CREATE UNIQUE INDEX "bible_notes_userId_lang_book_chapter_verse_key" ON "bible_notes"("userId", "lang", "book", "chapter", "verse");

-- AddForeignKey
ALTER TABLE "bible_bookmarks" ADD CONSTRAINT "bible_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bible_highlights" ADD CONSTRAINT "bible_highlights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bible_notes" ADD CONSTRAINT "bible_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bible_reading_position" ADD CONSTRAINT "bible_reading_position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
