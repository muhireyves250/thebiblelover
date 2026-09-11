-- CreateTable
CREATE TABLE "audio_episodes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "episodeDate" TIMESTAMP(3) NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audio_episodes_slot_episodeDate_idx" ON "audio_episodes"("slot", "episodeDate");

-- CreateIndex
CREATE INDEX "audio_episodes_isPublished_episodeDate_idx" ON "audio_episodes"("isPublished", "episodeDate");

-- CreateIndex
CREATE INDEX "audio_comments_episodeId_createdAt_idx" ON "audio_comments"("episodeId", "createdAt");

-- CreateIndex
CREATE INDEX "audio_comments_isApproved_idx" ON "audio_comments"("isApproved");

-- AddForeignKey
ALTER TABLE "audio_episodes" ADD CONSTRAINT "audio_episodes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_comments" ADD CONSTRAINT "audio_comments_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "audio_episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
