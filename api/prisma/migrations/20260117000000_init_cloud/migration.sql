-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FAITH', 'BIBLE_STUDY', 'PRAYER', 'TESTIMONY', 'REFLECTION', 'OTHER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'CAD', 'AUD');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'PAYPAL', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('SOCIAL_MEDIA', 'EMAIL', 'COPY_LINK', 'WHATSAPP', 'TELEGRAM', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "category" "Category" NOT NULL DEFAULT 'OTHER',
    "tags" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "replyMessage" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'STRIPE',
    "paymentId" TEXT NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "receiptSent" BOOLEAN NOT NULL DEFAULT false,
    "receiptEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bible_verses" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "translation" TEXT NOT NULL DEFAULT 'NIV',
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bible_verses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verse_of_the_day" (
    "id" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verse_of_the_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verse_shares" (
    "id" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "verseOfTheDayId" TEXT,
    "shareType" "ShareType" NOT NULL,
    "platform" TEXT,
    "recipientEmail" TEXT,
    "shareUrl" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isSuccessful" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verse_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "folder" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_publishedAt_idx" ON "blog_posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "blog_posts_category_idx" ON "blog_posts"("category");

-- CreateIndex
CREATE INDEX "blog_posts_tags_idx" ON "blog_posts"("tags");

-- CreateIndex
CREATE INDEX "contacts_status_createdAt_idx" ON "contacts"("status", "createdAt");

-- CreateIndex
CREATE INDEX "donations_status_createdAt_idx" ON "donations"("status", "createdAt");

-- CreateIndex
CREATE INDEX "donations_email_idx" ON "donations"("email");

-- CreateIndex
CREATE INDEX "comments_postId_createdAt_idx" ON "comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "comments_isApproved_idx" ON "comments"("isApproved");

-- CreateIndex
CREATE INDEX "bible_verses_book_chapter_verse_idx" ON "bible_verses"("book", "chapter", "verse");

-- CreateIndex
CREATE INDEX "bible_verses_isActive_isFeatured_idx" ON "bible_verses"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "bible_verses_displayDate_idx" ON "bible_verses"("displayDate");

-- CreateIndex
CREATE UNIQUE INDEX "verse_of_the_day_date_key" ON "verse_of_the_day"("date");

-- CreateIndex
CREATE INDEX "verse_of_the_day_date_isActive_idx" ON "verse_of_the_day"("date", "isActive");

-- CreateIndex
CREATE INDEX "verse_shares_verseId_createdAt_idx" ON "verse_shares"("verseId", "createdAt");

-- CreateIndex
CREATE INDEX "verse_shares_shareType_createdAt_idx" ON "verse_shares"("shareType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "media_filename_key" ON "media"("filename");

-- CreateIndex
CREATE INDEX "media_filename_idx" ON "media"("filename");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verse_of_the_day" ADD CONSTRAINT "verse_of_the_day_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "bible_verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verse_shares" ADD CONSTRAINT "verse_shares_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "bible_verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verse_shares" ADD CONSTRAINT "verse_shares_verseOfTheDayId_fkey" FOREIGN KEY ("verseOfTheDayId") REFERENCES "verse_of_the_day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

