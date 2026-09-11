# Morning/Evening Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin upload or in-browser-record a short audio devotional (title, description, cover photo, Morning/Evening slot, date), publish it, and let visitors browse it on the homepage, an archive page, and a detail page where they can like it and leave a moderated comment.

**Architecture:** Two new Prisma models (`AudioEpisode`, `AudioComment`), a new Cloudinary-backed audio upload route cloned from the existing video-upload pattern, a new `api/routes/audio-episodes.js` router (admin CRUD + public list/get/like/comments), and frontend additions following the codebase's existing conventions exactly: `ImageUpload`-style upload component, `PostsManager`/`AddPostModal`-style admin manager, `useCachedFetch`-based public hook, and `BlogPost.tsx`-style like/comment UI.

**Tech Stack:** Express + Prisma + PostgreSQL (Neon), Cloudinary, React + TypeScript + Vite, Tailwind. This repo has zero existing automated tests despite `jest` being installed (`api/package.json` has a `test` script but no `*.test.js` files exist anywhere in the repo) — verification throughout this plan follows the project's actual established practice of `node --check` / `tsc --noEmit` + manual `curl` smoke tests + browser walkthroughs (the same approach used for the recent Bible-verse `displayDate` fix), not a new jest suite.

**Spec:** `docs/superpowers/specs/2026-09-11-morning-evening-player-design.md`

## Global Constraints

- Anonymous likes are a plain counter with no dedup, matching `BlogPost.likes` behavior for unauthenticated users — no new `Like`-style join table for audio episodes.
- Comments require moderation: created with `isApproved: false`, only visible publicly after an admin approves them.
- No per-user like dedup, no draft/scheduling workflow beyond `isPublished` + `episodeDate`, no waveform/duration display — all explicitly out of scope per the spec.
- Do not `git push` — this repo has a standing "commit locally only" instruction from the user. Commit after each task as instructed below, but never push.
- New DB migration must go through Neon's Postgres — this sandbox's pooled (`-pooler`) connection has previously failed/silently no-op'd on DDL; if `prisma migrate dev` hangs or errors, fall back to the direct (non-pooler) connection string as described in Task 1.

---

### Task 1: Prisma schema — `AudioEpisode` and `AudioComment` models

**Files:**
- Modify: `api/prisma/schema.prisma`

**Interfaces:**
- Produces: Prisma models `AudioEpisode` (fields: `id, title, description, audioUrl, coverImage, slot, episodeDate, likes, isPublished, authorId, createdAt, updatedAt`, relation `author: User`, relation `comments: AudioComment[]`) and `AudioComment` (fields: `id, content, authorName, authorEmail, episodeId, isApproved, createdAt, updatedAt`, relation `episode: AudioEpisode`). Every later backend task's `prisma.audioEpisode.*` / `prisma.audioComment.*` calls depend on these exact field names.

- [ ] **Step 1: Add the two models to `api/prisma/schema.prisma`**

Insert after the `model Like { ... }` block (before `model SavedVerse`):

```prisma
model AudioEpisode {
  id          String         @id @default(cuid())
  title       String
  description String
  audioUrl    String
  coverImage  String
  slot        String         // "MORNING" | "EVENING"
  episodeDate DateTime
  likes       Int            @default(0)
  isPublished Boolean        @default(true)
  authorId    String
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  author      User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments    AudioComment[]

  @@index([slot, episodeDate])
  @@index([isPublished, episodeDate])
  @@map("audio_episodes")
}

model AudioComment {
  id          String       @id @default(cuid())
  content     String
  authorName  String
  authorEmail String
  episodeId   String
  isApproved  Boolean      @default(false)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  episode     AudioEpisode @relation(fields: [episodeId], references: [id], onDelete: Cascade)

  @@index([episodeId, createdAt])
  @@index([isApproved])
  @@map("audio_comments")
}
```

- [ ] **Step 2: Add the back-relation to `model User`**

In `api/prisma/schema.prisma`, find `blogPosts    BlogPost[]` inside `model User { ... }` and add a line directly under it:

```prisma
  audioEpisodes AudioEpisode[]
```

- [ ] **Step 3: Generate the Prisma client**

Run (from `api/`): `npx prisma generate`
Expected: `✔ Generated Prisma Client` with no errors — this only regenerates the client, it does not touch the database yet.

- [ ] **Step 4: Apply the migration to Neon**

Run (from `api/`): `npx prisma migrate dev --name add_audio_episode`

If this hangs for more than ~30 seconds or errors out (a known issue in this sandbox with Neon's pooled/pgbouncer connection silently failing on DDL), fall back to running the SQL by hand against the **direct** (non-pooler) connection:

1. Read `api/.env`'s `DATABASE_URL` and build a direct connection string by removing `-pooler` from the hostname (e.g. `ep-rough-water-ah3fkirv-pooler.c-3.us-east-1.aws.neon.tech` → `ep-rough-water-ah3fkirv.c-3.us-east-1.aws.neon.tech`).
2. Create a throwaway script `api/scripts/tmp-migrate-audio.mjs`:

```js
import pg from 'pg';

const directUrl = process.env.DIRECT_DATABASE_URL;
const client = new pg.Client({ connectionString: directUrl });

const sql = `
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

CREATE INDEX "audio_episodes_slot_episodeDate_idx" ON "audio_episodes"("slot", "episodeDate");
CREATE INDEX "audio_episodes_isPublished_episodeDate_idx" ON "audio_episodes"("isPublished", "episodeDate");
CREATE INDEX "audio_comments_episodeId_createdAt_idx" ON "audio_comments"("episodeId", "createdAt");
CREATE INDEX "audio_comments_isApproved_idx" ON "audio_comments"("isApproved");

ALTER TABLE "audio_episodes" ADD CONSTRAINT "audio_episodes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audio_comments" ADD CONSTRAINT "audio_comments_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "audio_episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

await client.connect();
await client.query(sql);
await client.end();
console.log('Audio episode tables created.');
```

3. Run it: `DIRECT_DATABASE_URL="<direct connection string>" node api/scripts/tmp-migrate-audio.mjs`
4. Mark the migration as applied so Prisma's migration history stays consistent: `npx prisma migrate resolve --applied add_audio_episode` (from `api/`; if no migration folder was generated because `migrate dev` failed before writing one, instead run `npx prisma db pull` then `npx prisma generate` to sync the client with the now-manually-created tables — do not let the schema and live DB drift).
5. Delete the throwaway script: `rm api/scripts/tmp-migrate-audio.mjs`

- [ ] **Step 5: Verify the tables exist**

Run: `cd api && node -e "import('./lib/prisma.js').then(async ({prisma}) => { console.log(await prisma.audioEpisode.findMany()); console.log(await prisma.audioComment.findMany()); process.exit(0); })"`
Expected: both print `[]` with no errors.

- [ ] **Step 6: Commit**

```bash
git add api/prisma/schema.prisma
git commit -m "$(cat <<'EOF'
Add AudioEpisode and AudioComment Prisma models

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Backend — audio upload middleware + route

**Files:**
- Modify: `api/middleware/upload.js`
- Modify: `api/routes/upload.js`

**Interfaces:**
- Consumes: `cloudinary` default export from `api/lib/cloudinary.js` (`cloudinary.uploader.upload_stream(options, callback)`); `prisma` from `api/lib/prisma.js` (`prisma.media.create`).
- Produces: `uploadAudio` multer middleware (exported from `api/middleware/upload.js`, field name `audio`), and `POST /api/upload/audio` + `GET /api/upload/audio/:filename` routes. Frontend Task 7 calls `POST /upload/audio` expecting the same response shape as `POST /upload/video`: `{ success, message, data: { filename, originalName, size, url, fullUrl } }`.

- [ ] **Step 1: Add the audio multer config**

In `api/middleware/upload.js`, add after `videoFileFilter`:

```js
// Audio upload filter
const audioFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg',
    'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/m4a'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP3, WAV, OGG, WEBM, and M4A audio files are allowed!'), false);
  }
};
```

And after the `uploadVideo` export:

```js
export const uploadAudio = multer({
  storage: storage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}).single('audio');
```

- [ ] **Step 2: Add the `POST /audio` route**

In `api/routes/upload.js`, add the import: change

```js
import { uploadSingle, uploadVideo, handleUploadError } from '../middleware/upload.js';
```

to

```js
import { uploadSingle, uploadVideo, uploadAudio, handleUploadError } from '../middleware/upload.js';
```

Then add this route, placed directly after the existing `POST /video` route (before `POST /profile-image`):

```js
// Upload single audio file
router.post('/audio', verifyToken, requireAdmin, uploadAudio, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file provided' });
    }

    const filename = `audio-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname) || '.webm'}`;
    let audioUrl;
    let cloudinaryResult = null;

    if (isCloudinaryConfigured()) {
      try {
        const uploadToCloudinary = (buffer) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'bible-project/audio', resource_type: 'video' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
          });
        };
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        audioUrl = cloudinaryResult.secure_url;
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      }
    }

    if (!audioUrl) {
      await saveBufferToDisk(req.file.buffer, filename, 'audio');
      audioUrl = `/api/upload/audio/${filename}`;
    }

    await prisma.media.create({
      data: {
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: cloudinaryResult?.secure_url || null,
        publicId: cloudinaryResult?.public_id || null,
        folder: 'audio'
      }
    });

    const fullUrl = getFullUrl(req, audioUrl);

    res.json({
      success: true,
      message: cloudinaryResult ? 'Audio uploaded to Cloudinary successfully' : 'Audio uploaded to local storage successfully',
      data: {
        filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: audioUrl,
        fullUrl: fullUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload audio' });
  }
});
```

- [ ] **Step 3: Add the `GET /audio/:filename` serving route**

Add directly after the existing `GET /profiles/:filename` route:

```js
// Serve uploaded audio
router.get('/audio/:filename', async (req, res) => {
  await serveFile(req, res, 'audio');
});
```

- [ ] **Step 4: Syntax-check**

Run: `node --check api/middleware/upload.js && node --check api/routes/upload.js`
Expected: no output (success).

- [ ] **Step 5: Manual smoke test**

Restart the API server (background), then:

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@biblelover.com","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['token'])")
# Use any small local audio/mp3 or wav test file, e.g. generate a tiny silent wav:
python3 -c "
import wave, struct
w = wave.open('/tmp/test-audio.wav','w')
w.setnchannels(1); w.setsampwidth(2); w.setframerate(8000)
w.writeframes(struct.pack('<h', 0) * 8000)
w.close()
"
curl -s -X POST http://localhost:5000/api/upload/audio -H "Authorization: Bearer $TOKEN" -F "audio=@/tmp/test-audio.wav;type=audio/wav" | python3 -m json.tool
```

Expected: `"success": true` and a `data.url`/`data.fullUrl` pointing at either a Cloudinary URL or `/api/upload/audio/audio-...wav`. Then fetch that URL with `curl -sI <fullUrl>` and confirm a `200`.

- [ ] **Step 6: Commit**

```bash
git add api/middleware/upload.js api/routes/upload.js
git commit -m "$(cat <<'EOF'
Add audio upload route, cloned from the existing video-upload pattern

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Backend — Joi validation schemas

**Files:**
- Modify: `api/middleware/validation.js`

**Interfaces:**
- Produces: `validateAudioEpisode`, `validateAudioEpisodeUpdate`, `validateAudioComment` middleware, imported by Task 4/5's route file as `import { validateAudioEpisode, validateAudioEpisodeUpdate, validateAudioComment } from '../middleware/validation.js';`.

- [ ] **Step 1: Add the schemas**

Add after `validateBibleVerseUpdate` (before the "Blog post validation schemas" comment):

```js
// Audio episode validation schemas
export const validateAudioEpisode = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    audioUrl: Joi.string().uri().required(),
    coverImage: Joi.string().uri().required(),
    slot: Joi.string().valid('MORNING', 'EVENING').required(),
    episodeDate: Joi.date().iso().optional(),
    isPublished: Joi.boolean().default(true)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateAudioEpisodeUpdate = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().min(10).max(2000).optional(),
    audioUrl: Joi.string().uri().optional(),
    coverImage: Joi.string().uri().optional(),
    slot: Joi.string().valid('MORNING', 'EVENING').optional(),
    episodeDate: Joi.date().iso().optional(),
    isPublished: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateAudioComment = (req, res, next) => {
  const schema = Joi.object({
    authorName: Joi.string().min(2).max(100).required(),
    authorEmail: Joi.string().email().required(),
    content: Joi.string().min(2).max(1000).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};
```

- [ ] **Step 2: Syntax-check**

Run: `node --check api/middleware/validation.js`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add api/middleware/validation.js
git commit -m "$(cat <<'EOF'
Add Joi validation schemas for audio episodes and comments

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Backend — `api/routes/audio-episodes.js` (episode CRUD + like/unlike)

**Files:**
- Create: `api/routes/audio-episodes.js`

**Interfaces:**
- Consumes: `prisma` (`api/lib/prisma.js`), `verifyToken`/`requireAdmin`/`optionalAuth` (`api/middleware/auth.js`), `validateAudioEpisode`/`validateAudioEpisodeUpdate` (Task 3).
- Produces: this router, mounted at `/api/audio-episodes` in Task 6. Routes: `GET /admin/all`, `POST /`, `PUT /:id`, `DELETE /:id`, `GET /`, `GET /:id`, `POST /:id/like`, `POST /:id/unlike`. Task 5 appends the comment routes to this same file. Task 7 (frontend) calls these exact paths.

- [ ] **Step 1: Write the file — imports, admin list, create**

```js
import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validateAudioEpisode, validateAudioEpisodeUpdate, validateAudioComment } from '../middleware/validation.js';

const router = express.Router();

// Admin: list all episodes (published + unpublished), optional slot filter
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { slot } = req.query;
    const where = {};
    if (slot === 'MORNING' || slot === 'EVENING') where.slot = slot;

    const episodes = await prisma.audioEpisode.findMany({
      where,
      orderBy: { episodeDate: 'desc' },
      include: { _count: { select: { comments: true } } }
    });

    res.json({
      success: true,
      data: {
        episodes: episodes.map(e => ({ ...e, commentsCount: e._count.comments, _count: undefined }))
      }
    });
  } catch (error) {
    console.error('List audio episodes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch episodes' });
  }
});

// Admin: create episode
router.post('/', verifyToken, requireAdmin, validateAudioEpisode, async (req, res) => {
  try {
    const { title, description, audioUrl, coverImage, slot, episodeDate, isPublished } = req.body;

    const episode = await prisma.audioEpisode.create({
      data: {
        title,
        description,
        audioUrl,
        coverImage,
        slot,
        // Posting an episode with no explicit date makes it "today's" —
        // same fix already applied to bible-verses.js's create route, for
        // the same reason: a null date can never sort to the top or match
        // a day filter.
        episodeDate: episodeDate ? new Date(episodeDate) : new Date(),
        isPublished: isPublished ?? true,
        authorId: req.user.id
      }
    });

    res.status(201).json({ success: true, message: 'Audio episode created successfully', data: { episode } });
  } catch (error) {
    console.error('Create audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to create episode' });
  }
});
```

- [ ] **Step 2: Add update and delete routes**

Append:

```js
// Admin: update episode
router.put('/:id', verifyToken, requireAdmin, validateAudioEpisodeUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.episodeDate) {
      updateData.episodeDate = new Date(updateData.episodeDate);
    }

    const episode = await prisma.audioEpisode.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, message: 'Audio episode updated successfully', data: { episode } });
  } catch (error) {
    console.error('Update audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to update episode' });
  }
});

// Admin: delete episode
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.audioEpisode.delete({ where: { id } });
    res.json({ success: true, message: 'Audio episode deleted successfully' });
  } catch (error) {
    console.error('Delete audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete episode' });
  }
});
```

- [ ] **Step 3: Add public list, get, like, unlike routes**

Append (note: `GET /` and `GET /:id` are registered after `/admin/all` above and before this point is irrelevant since `/admin/all` has two static segments and won't collide with `/:id`'s single segment — but `GET /:id` itself must still come after any other single-segment static route this file defines; there are none, so this is safe):

```js
// Public: list published episodes, optional slot filter, paginated
router.get('/', async (req, res) => {
  try {
    const { slot } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const where = { isPublished: true };
    if (slot === 'MORNING' || slot === 'EVENING') where.slot = slot;

    const [episodes, total] = await Promise.all([
      prisma.audioEpisode.findMany({
        where,
        orderBy: { episodeDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.audioEpisode.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        episodes,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('List audio episodes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch episodes' });
  }
});

// Public: get one episode
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const episode = await prisma.audioEpisode.findFirst({ where: { id, isPublished: true } });
    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }
    res.json({ success: true, data: { episode } });
  } catch (error) {
    console.error('Get audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch episode' });
  }
});

// Public: like an episode (anonymous or authenticated — plain counter, no dedup)
router.post('/:id/like', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const episode = await prisma.audioEpisode.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });
    res.json({ success: true, message: 'Episode liked', data: { likes: episode.likes } });
  } catch (error) {
    console.error('Like audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to like episode' });
  }
});

// Public: unlike an episode
router.post('/:id/unlike', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const episode = await prisma.audioEpisode.update({
      where: { id },
      data: { likes: { decrement: 1 } }
    });
    res.json({ success: true, message: 'Episode unliked', data: { likes: Math.max(0, episode.likes) } });
  } catch (error) {
    console.error('Unlike audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlike episode' });
  }
});

export default router;
```

- [ ] **Step 4: Syntax-check**

Run: `node --check api/routes/audio-episodes.js`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add api/routes/audio-episodes.js
git commit -m "$(cat <<'EOF'
Add audio episode CRUD, like/unlike routes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

(Full end-to-end curl verification, including comments, happens in Task 6 after mounting.)

---

### Task 5: Backend — comment routes (public + admin moderation)

**Files:**
- Modify: `api/routes/audio-episodes.js`

**Interfaces:**
- Consumes: `validateAudioComment` (Task 3), already imported in Task 4's Step 1.
- Produces: `GET /:id/comments`, `POST /:id/comments`, `GET /admin/comments`, `GET /admin/:id/comments`, `PUT /admin/comments/:commentId/approve`, `DELETE /admin/comments/:commentId`. Task 7's `AudioEpisodesAPI.getComments/addComment/getAdminComments/approveComment/deleteCommentAdmin` call these exact paths.

- [ ] **Step 1: Insert public comment routes**

In `api/routes/audio-episodes.js`, insert directly before `export default router;`:

```js
// Public: list approved comments for an episode
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await prisma.audioComment.findMany({
      where: { episodeId: id, isApproved: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { comments } });
  } catch (error) {
    console.error('List audio comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to load comments' });
  }
});

// Public: submit a comment — held for moderation (isApproved: false)
router.post('/:id/comments', validateAudioComment, async (req, res) => {
  try {
    const { id } = req.params;
    const { authorName, authorEmail, content } = req.body;

    const episode = await prisma.audioEpisode.findUnique({ where: { id } });
    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    const comment = await prisma.audioComment.create({
      data: { content, authorName, authorEmail, episodeId: id, isApproved: false }
    });

    res.status(201).json({
      success: true,
      message: 'Comment submitted and awaiting approval',
      data: { comment }
    });
  } catch (error) {
    console.error('Create audio comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit comment' });
  }
});
```

- [ ] **Step 2: Insert admin comment moderation routes**

Insert directly after the routes from Step 1 (still before `export default router;`):

```js
// Admin: list all comments (optional status filter), or comments for one episode
router.get('/admin/comments', verifyToken, requireAdmin, async (req, res) => {
  try {
    const status = req.query.status; // 'approved' | 'pending'
    const where = {};
    if (status === 'approved') where.isApproved = true;
    if (status === 'pending') where.isApproved = false;

    const comments = await prisma.audioComment.findMany({
      where,
      include: { episode: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { comments } });
  } catch (error) {
    console.error('Admin list audio comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// Admin: list comments for one episode (all, regardless of approval)
router.get('/admin/:id/comments', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await prisma.audioComment.findMany({
      where: { episodeId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { comments } });
  } catch (error) {
    console.error('Admin list episode comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// Admin: approve a comment
router.put('/admin/comments/:commentId/approve', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await prisma.audioComment.update({
      where: { id: commentId },
      data: { isApproved: true }
    });
    res.json({ success: true, message: 'Comment approved', data: { comment } });
  } catch (error) {
    console.error('Approve audio comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve comment' });
  }
});

// Admin: delete a comment
router.delete('/admin/comments/:commentId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;
    await prisma.audioComment.delete({ where: { id: commentId } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete audio comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});
```

**Route-ordering note:** `/admin/comments` and `/admin/:id/comments` are two- and three-segment paths; Task 4's `GET /:id` is one segment, so there is no collision — Express matches by both path shape and registration order, and `/admin/...` never matches a single-segment `:id` pattern. No reordering needed.

- [ ] **Step 3: Syntax-check**

Run: `node --check api/routes/audio-episodes.js`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add api/routes/audio-episodes.js
git commit -m "$(cat <<'EOF'
Add audio comment routes with admin moderation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Backend — mount router + full end-to-end smoke test

**Files:**
- Modify: `api/server.js`

**Interfaces:**
- Consumes: default export from `api/routes/audio-episodes.js` (Tasks 4+5).
- Produces: `/api/audio-episodes/*` reachable on the running server. Frontend Task 7's `API_URL` base + these paths must match exactly.

- [ ] **Step 1: Import and mount the router**

In `api/server.js`, add to the routes import block (after `import homeFeedRoutes from './routes/home-feed.js';`):

```js
import audioEpisodeRoutes from './routes/audio-episodes.js';
```

Add to the mounting block (after `app.use('/api/home-feed', homeFeedRoutes);`):

```js
app.use('/api/audio-episodes', audioEpisodeRoutes);
```

- [ ] **Step 2: Syntax-check**

Run: `node --check api/server.js`
Expected: no output.

- [ ] **Step 3: Restart the API server and run the full flow**

Restart (background) the API server, then run:

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@biblelover.com","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['token'])")

# Create
CREATE=$(curl -s -X POST http://localhost:5000/api/audio-episodes -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{
  "title": "Morning Devotional Test",
  "description": "A short test devotional to verify the audio episode pipeline end to end.",
  "audioUrl": "https://res.cloudinary.com/demo/video/upload/dog.mp3",
  "coverImage": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "slot": "MORNING"
}')
echo "$CREATE" | python3 -m json.tool
ID=$(echo "$CREATE" | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['episode']['id'])")

# Verify episodeDate defaulted to today
echo "$CREATE" | python3 -c "import sys,json;print('episodeDate:', json.load(sys.stdin)['data']['episode']['episodeDate'])"

# Public list shows it
curl -s "http://localhost:5000/api/audio-episodes?slot=MORNING" | python3 -m json.tool

# Public get
curl -s "http://localhost:5000/api/audio-episodes/$ID" | python3 -m json.tool

# Like
curl -s -X POST "http://localhost:5000/api/audio-episodes/$ID/like" | python3 -m json.tool

# Comment (should NOT show up in public list yet — isApproved: false)
curl -s -X POST "http://localhost:5000/api/audio-episodes/$ID/comments" -H "Content-Type: application/json" -d '{"authorName":"Test User","authorEmail":"test@example.com","content":"Great devotional!"}' | python3 -m json.tool
curl -s "http://localhost:5000/api/audio-episodes/$ID/comments" | python3 -m json.tool
# Expected: empty comments array (not yet approved)

# Admin sees it pending
curl -s "http://localhost:5000/api/audio-episodes/admin/comments?status=pending" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
COMMENT_ID=$(curl -s "http://localhost:5000/api/audio-episodes/admin/comments?status=pending" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['comments'][0]['id'])")

# Approve it
curl -s -X PUT "http://localhost:5000/api/audio-episodes/admin/comments/$COMMENT_ID/approve" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Public list now shows it
curl -s "http://localhost:5000/api/audio-episodes/$ID/comments" | python3 -m json.tool
# Expected: one comment, "Great devotional!"

# Update
curl -s -X PUT "http://localhost:5000/api/audio-episodes/$ID" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"title":"Morning Devotional Test (Updated)"}' | python3 -m json.tool

# Clean up
curl -s -X DELETE "http://localhost:5000/api/audio-episodes/$ID" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

Expected at each step: `"success": true`; the pre-approval comment fetch returns an empty array; the post-approval fetch returns the one comment; the delete at the end succeeds (confirm with a final `GET /api/audio-episodes/$ID` returning 404).

- [ ] **Step 4: Commit**

```bash
git add api/server.js
git commit -m "$(cat <<'EOF'
Mount audio-episodes router

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Frontend — types + API service

**Files:**
- Modify: `frontend/src/services/api.d.ts`
- Modify: `frontend/src/services/api.ts`

**Interfaces:**
- Produces: `AudioEpisode`, `AudioComment` types; `AudioEpisodesAPI` interface + `audioEpisodesAPI` implementation; `uploadAPI.uploadAudio`. Registered in the `apis` aggregate as `apis.audioEpisodes`. All later frontend tasks import `audioEpisodesAPI` and `uploadAPI` from `../services/api` and the `AudioEpisode`/`AudioComment` types from `../services/api.d`.

- [ ] **Step 1: Add types to `api.d.ts`**

Add near the `Comment` interface:

```ts
export interface AudioEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  coverImage: string;
  slot: 'MORNING' | 'EVENING';
  episodeDate: string;
  likes: number;
  isPublished: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  commentsCount?: number;
}

export interface AudioComment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  episodeId: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  episode?: { id: string; title: string };
}
```

- [ ] **Step 2: Add `AudioEpisodesAPI` interface to `api.d.ts`**

Add near `BlogAPI`:

```ts
export interface AudioEpisodesAPI {
  getEpisodes: (params?: { slot?: 'MORNING' | 'EVENING'; page?: number; limit?: number }) => Promise<ApiResponse<{ episodes: AudioEpisode[]; pagination: any }>>;
  getEpisode: (id: string) => Promise<ApiResponse<{ episode: AudioEpisode }>>;
  getAllEpisodes: (params?: { slot?: 'MORNING' | 'EVENING' }) => Promise<ApiResponse<{ episodes: AudioEpisode[] }>>;
  createEpisode: (data: any) => Promise<ApiResponse<{ episode: AudioEpisode }>>;
  updateEpisode: (id: string, data: any) => Promise<ApiResponse<{ episode: AudioEpisode }>>;
  deleteEpisode: (id: string) => Promise<ApiResponse>;
  likeEpisode: (id: string) => Promise<ApiResponse<{ likes: number }>>;
  unlikeEpisode: (id: string) => Promise<ApiResponse<{ likes: number }>>;
  getComments: (id: string) => Promise<ApiResponse<{ comments: AudioComment[] }>>;
  addComment: (id: string, data: { authorName: string; authorEmail: string; content: string }) => Promise<ApiResponse>;
  getAdminComments: (params?: { status?: 'approved' | 'pending' }) => Promise<ApiResponse<{ comments: AudioComment[] }>>;
  approveComment: (commentId: string) => Promise<ApiResponse>;
  deleteCommentAdmin: (commentId: string) => Promise<ApiResponse>;
}
```

- [ ] **Step 3: Extend `UploadAPI` interface in `api.d.ts`**

Change:

```ts
export interface UploadAPI {
  uploadImage: (file: File) => Promise<ApiResponse<{ url: string; filename: string; fullUrl: string }>>;
  uploadProfileImage: (file: File) => Promise<ApiResponse<{ url: string; filename: string }>>;
  uploadVideo: (file: File) => Promise<ApiResponse<{ url: string; filename: string; fullUrl: string }>>;
}
```

to:

```ts
export interface UploadAPI {
  uploadImage: (file: File) => Promise<ApiResponse<{ url: string; filename: string; fullUrl: string }>>;
  uploadProfileImage: (file: File) => Promise<ApiResponse<{ url: string; filename: string }>>;
  uploadVideo: (file: File) => Promise<ApiResponse<{ url: string; filename: string; fullUrl: string }>>;
  uploadAudio: (file: File) => Promise<ApiResponse<{ url: string; filename: string; fullUrl: string }>>;
}
```

- [ ] **Step 4: Also extend the top-level `API` interface in `api.d.ts`**

Find the interface that aggregates all API objects (it lists `blog: BlogAPI`, `upload: UploadAPI`, etc. — same names as the `apis` object in `api.ts`) and add `audioEpisodes: AudioEpisodesAPI;` to it.

- [ ] **Step 5: Implement `audioEpisodesAPI` in `api.ts`**

Add, near `blogAPI`:

```ts
export const audioEpisodesAPI: AudioEpisodesAPI = {
  getEpisodes: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/audio-episodes?${query}`);
  },
  getEpisode: (id) => apiRequest(`/audio-episodes/${id}`),
  getAllEpisodes: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/audio-episodes/admin/all?${query}`);
  },
  createEpisode: (data) => apiRequest('/audio-episodes', { method: 'POST', body: JSON.stringify(data) }),
  updateEpisode: (id, data) => apiRequest(`/audio-episodes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEpisode: (id) => apiRequest(`/audio-episodes/${id}`, { method: 'DELETE' }),
  likeEpisode: (id) => apiRequest(`/audio-episodes/${id}/like`, { method: 'POST' }),
  unlikeEpisode: (id) => apiRequest(`/audio-episodes/${id}/unlike`, { method: 'POST' }),
  getComments: (id) => apiRequest(`/audio-episodes/${id}/comments`),
  addComment: (id, data) => apiRequest(`/audio-episodes/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  getAdminComments: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/audio-episodes/admin/comments?${query}`);
  },
  approveComment: (commentId) => apiRequest(`/audio-episodes/admin/comments/${commentId}/approve`, { method: 'PUT' }),
  deleteCommentAdmin: (commentId) => apiRequest(`/audio-episodes/admin/comments/${commentId}`, { method: 'DELETE' }),
};
```

Import the type at the top of `api.ts` alongside the other imported interfaces: add `AudioEpisodesAPI` to whatever existing `import type { ... } from './api.d'` (or equivalent) line already brings in `BlogAPI`, `UploadAPI`, etc.

- [ ] **Step 6: Add `uploadAudio` to the `uploadAPI` object in `api.ts`**

```ts
export const uploadAPI: UploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiRequest('/upload/image', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined },
    });
  },
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return apiRequest('/upload/video', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined },
    });
  },
  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append('audio', file);
    return apiRequest('/upload/audio', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined },
    });
  },
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiRequest('/upload/profile-image', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined },
    });
  },
};
```

- [ ] **Step 7: Register in the `apis` aggregate**

In the `const apis: API = { ... }` object at the bottom of `api.ts`, add `audioEpisodes: audioEpisodesAPI,` (anywhere in the object, e.g. after `blog: blogAPI,`).

- [ ] **Step 8: Typecheck**

Run (from `frontend/`): `npx tsc --noEmit -p . 2>&1 | grep -i "api.ts\|api.d.ts"`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/services/api.d.ts frontend/src/services/api.ts
git commit -m "$(cat <<'EOF'
Add AudioEpisode/AudioComment types and API service

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Frontend — `useAudioEpisodes` hook

**Files:**
- Create: `frontend/src/hooks/useAudioEpisodes.ts`

**Interfaces:**
- Consumes: `useCachedFetch` (`./useAPI`), `audioEpisodesAPI` (`../services/api`), `AudioEpisode` type (`../services/api.d`).
- Produces: `useAudioEpisodes(limit = 20)` returning `{ episodes: AudioEpisode[], hasLoaded: boolean, loading, error, refetch }`, consumed by Task 11's `PlayerDesk.tsx`.

- [ ] **Step 1: Write the hook**

```ts
import { useCachedFetch } from './useAPI';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';

export type { AudioEpisode };

export const useAudioEpisodes = (limit = 20) => {
  const { data, loading, error, refetch } = useCachedFetch<AudioEpisode[]>(
    `audioEpisodes:v1:${limit}`,
    async () => {
      const response = await audioEpisodesAPI.getEpisodes({ limit });
      if (!response.success) throw new Error(response.message || 'Failed to load audio episodes');
      return response.data?.episodes || [];
    },
    { ttl: 5 * 60 * 1000 }
  );

  return {
    episodes: data || [],
    hasLoaded: data !== null,
    loading,
    error,
    refetch
  };
};
```

- [ ] **Step 2: Typecheck**

Run (from `frontend/`): `npx tsc --noEmit -p . 2>&1 | grep -i useAudioEpisodes`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useAudioEpisodes.ts
git commit -m "$(cat <<'EOF'
Add useAudioEpisodes hook

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Frontend — `AudioUpload` component (upload + in-browser recording)

**Files:**
- Create: `frontend/src/components/AudioUpload.tsx`

**Interfaces:**
- Consumes: `uploadAPI.uploadAudio` (`../services/api`).
- Produces: `<AudioUpload value={string} onChange={(url: string) => void} onError?={(msg: string) => void} />`, consumed by Task 10's `AddAudioEpisodeModal`/`EditAudioEpisodeModal`.

- [ ] **Step 1: Write the component**

```tsx
import React, { useState, useRef } from 'react';
import { Upload, X, Mic, Square, AlertCircle } from 'lucide-react';
import { uploadAPI } from '../services/api';

interface AudioUploadProps {
  value?: string;
  onChange: (audioUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

const AudioUpload: React.FC<AudioUploadProps> = ({
  value,
  onChange,
  onError,
  className = '',
  disabled = false
}) => {
  const [mode, setMode] = useState<'upload' | 'record'>('upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const doUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const data = await uploadAPI.uploadAudio(file);
      if (data.success && data.data) {
        onChange(data.data.fullUrl);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      const msg = 'Please select an audio file';
      setError(msg);
      onError?.(msg);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      const msg = 'File size must be less than 50MB';
      setError(msg);
      onError?.(msg);
      return;
    }
    doUpload(file);
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        streamRef.current?.getTracks().forEach(track => track.stop());
        doUpload(file);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      const msg = 'Microphone access was denied or is unavailable';
      setError(msg);
      onError?.(msg);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">Audio</label>

      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border ${
            mode === 'upload' ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('record')}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border ${
            mode === 'record' ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Record
        </button>
      </div>

      {value && (
        <div className="flex items-center gap-3 mb-2">
          <audio controls src={value} className="flex-1 h-10" />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mode === 'upload' ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={disabled ? undefined : openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                <span className="text-amber-700 font-medium">Click to upload</span> an audio file
              </p>
              <p className="text-xs text-gray-500 mt-1">MP3, WAV, OGG, M4A up to 50MB</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading recording...</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AudioUpload;
```

- [ ] **Step 2: Typecheck**

Run (from `frontend/`): `npx tsc --noEmit -p . 2>&1 | grep -i AudioUpload`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/AudioUpload.tsx
git commit -m "$(cat <<'EOF'
Add AudioUpload component (file upload + in-browser recording)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Frontend — Admin `AddAudioEpisodeModal` / `EditAudioEpisodeModal`

**Files:**
- Create: `frontend/src/components/AddAudioEpisodeModal.tsx`
- Create: `frontend/src/components/EditAudioEpisodeModal.tsx`

**Interfaces:**
- Consumes: `ImageUpload` (`./ImageUpload`), `AudioUpload` (Task 9), `audioEpisodesAPI` (`../services/api`), `AudioEpisode` type (`../services/api.d`).
- Produces: `<AddAudioEpisodeModal isOpen onClose onSave={(episode: AudioEpisode) => void} />` and `<EditAudioEpisodeModal isOpen onClose episode={AudioEpisode} onSave={(episode: AudioEpisode) => void} />`, consumed by Task 11's `AudioEpisodeManager` and `Dashboard.tsx`.

- [ ] **Step 1: Write `AddAudioEpisodeModal.tsx`**

```tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import ImageUpload from './ImageUpload';
import AudioUpload from './AudioUpload';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';

interface AddAudioEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (episode: AudioEpisode) => void;
}

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const AddAudioEpisodeModal: React.FC<AddAudioEpisodeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    audioUrl: '',
    coverImage: '',
    slot: 'MORNING' as 'MORNING' | 'EVENING',
    episodeDate: todayIsoDate(),
    isPublished: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      audioUrl: '',
      coverImage: '',
      slot: 'MORNING',
      episodeDate: todayIsoDate(),
      isPublished: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (!formData.audioUrl) {
      setError('Please upload or record an audio file.');
      return;
    }
    if (!formData.coverImage) {
      setError('Please upload a cover photo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await audioEpisodesAPI.createEpisode({
        ...formData,
        episodeDate: new Date(formData.episodeDate).toISOString()
      });
      if (response.success && response.data?.episode) {
        onSave(response.data.episode);
        resetForm();
        onClose();
      } else {
        setError(response.message || 'Failed to create episode');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create episode');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Morning/Evening Episode</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <ImageUpload
            value={formData.coverImage}
            onChange={(url) => setFormData({ ...formData, coverImage: url })}
          />

          <AudioUpload
            value={formData.audioUrl}
            onChange={(url) => setFormData({ ...formData, audioUrl: url })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slot</label>
              <select
                value={formData.slot}
                onChange={(e) => setFormData({ ...formData, slot: e.target.value as 'MORNING' | 'EVENING' })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="MORNING">Morning</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.episodeDate}
                onChange={(e) => setFormData({ ...formData, episodeDate: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-700 border border-gray-300">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-amber-700 text-white font-bold hover:bg-amber-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Publish Episode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAudioEpisodeModal;
```

- [ ] **Step 2: Write `EditAudioEpisodeModal.tsx`**

Same shape as `AddAudioEpisodeModal`, pre-filled from an `episode` prop and calling `updateEpisode` instead of `createEpisode`:

```tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import ImageUpload from './ImageUpload';
import AudioUpload from './AudioUpload';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';

interface EditAudioEpisodeModalProps {
  isOpen: boolean;
  episode: AudioEpisode;
  onClose: () => void;
  onSave: (episode: AudioEpisode) => void;
}

const EditAudioEpisodeModal: React.FC<EditAudioEpisodeModalProps> = ({ isOpen, episode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: episode.title,
    description: episode.description,
    audioUrl: episode.audioUrl,
    coverImage: episode.coverImage,
    slot: episode.slot,
    episodeDate: episode.episodeDate.slice(0, 10),
    isPublished: episode.isPublished
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await audioEpisodesAPI.updateEpisode(episode.id, {
        ...formData,
        episodeDate: new Date(formData.episodeDate).toISOString()
      });
      if (response.success && response.data?.episode) {
        onSave(response.data.episode);
        onClose();
      } else {
        setError(response.message || 'Failed to update episode');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update episode');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Episode</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <ImageUpload
            value={formData.coverImage}
            onChange={(url) => setFormData({ ...formData, coverImage: url })}
          />

          <AudioUpload
            value={formData.audioUrl}
            onChange={(url) => setFormData({ ...formData, audioUrl: url })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slot</label>
              <select
                value={formData.slot}
                onChange={(e) => setFormData({ ...formData, slot: e.target.value as 'MORNING' | 'EVENING' })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="MORNING">Morning</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.episodeDate}
                onChange={(e) => setFormData({ ...formData, episodeDate: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700">Published</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPublished ? 'bg-amber-700' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-700 border border-gray-300">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-amber-700 text-white font-bold hover:bg-amber-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAudioEpisodeModal;
```

- [ ] **Step 3: Typecheck**

Run (from `frontend/`): `npx tsc --noEmit -p . 2>&1 | grep -i "AudioEpisodeModal"`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/AddAudioEpisodeModal.tsx frontend/src/components/EditAudioEpisodeModal.tsx
git commit -m "$(cat <<'EOF'
Add admin add/edit modals for audio episodes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Frontend — `AudioEpisodeManager` + `Dashboard.tsx` wiring

**Files:**
- Create: `frontend/src/components/AudioEpisodeManager.tsx`
- Modify: `frontend/src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: `audioEpisodesAPI` (`../services/api`), `AddAudioEpisodeModal`/`EditAudioEpisodeModal` (Task 10), `AudioEpisode` type.
- Produces: an `audio-episodes` Dashboard tab, fully self-contained (owns its own list-fetching, unlike `PostsManager` which is purely presentational — this matches `BibleVerseManager`'s self-contained pattern since there's no pre-existing shared episode state in `Dashboard.tsx` to prop-drill).

- [ ] **Step 1: Write `AudioEpisodeManager.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Heart } from 'lucide-react';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';
import AddAudioEpisodeModal from './AddAudioEpisodeModal';
import EditAudioEpisodeModal from './EditAudioEpisodeModal';

const AudioEpisodeManager: React.FC = () => {
  const [episodes, setEpisodes] = useState<AudioEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<AudioEpisode | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      const response = await audioEpisodesAPI.getAllEpisodes();
      if (response.success && response.data) {
        setEpisodes(response.data.episodes);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpisodes();
  }, []);

  const handleDelete = async (id: string) => {
    const response = await audioEpisodesAPI.deleteEpisode(id);
    if (response.success) {
      setEpisodes(prev => prev.filter(e => e.id !== id));
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Morning/Evening Episodes</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-bold hover:bg-amber-800"
        >
          <Plus className="w-4 h-4" /> New Episode
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading episodes...</p>
      ) : episodes.length === 0 ? (
        <p className="text-sm text-gray-500">No episodes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                <th className="py-2">Episode</th>
                <th className="py-2">Slot</th>
                <th className="py-2">Date</th>
                <th className="py-2">Likes</th>
                <th className="py-2">Comments</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {episodes.map((episode) => (
                <tr key={episode.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 flex items-center gap-2">
                    <img src={episode.coverImage} alt={episode.title} className="w-10 h-10 rounded object-cover" />
                    <span className="font-medium text-gray-900">{episode.title}</span>
                  </td>
                  <td className="py-2">{episode.slot === 'MORNING' ? 'Morning' : 'Evening'}</td>
                  <td className="py-2">{new Date(episode.episodeDate).toLocaleDateString()}</td>
                  <td className="py-2">
                    <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> {episode.likes}</span>
                  </td>
                  <td className="py-2">
                    <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3 text-purple-500" /> {episode.commentsCount ?? 0}</span>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${episode.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {episode.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-1">
                      <button onClick={() => setEditingEpisode(episode)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(episode.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddAudioEpisodeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={(episode) => setEpisodes(prev => [episode, ...prev])}
        />
      )}

      {editingEpisode && (
        <EditAudioEpisodeModal
          isOpen={!!editingEpisode}
          episode={editingEpisode}
          onClose={() => setEditingEpisode(null)}
          onSave={(episode) => setEpisodes(prev => prev.map(e => e.id === episode.id ? episode : e))}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <p className="text-gray-900 font-bold mb-2">Delete this episode?</p>
            <p className="text-sm text-gray-500 mb-4">This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioEpisodeManager;
```

- [ ] **Step 2: Wire into `Dashboard.tsx`**

Add the import (near `import BibleVerseManager from '../components/BibleVerseManager';`):

```tsx
import AudioEpisodeManager from '../components/AudioEpisodeManager';
```

Add a sidebar entry to the tab array (the one containing `{ id: 'bible-verses', label: 'Wisdom', ... }`) — add this object to that array, e.g. right after the `bible-verses` entry:

```tsx
{ id: 'audio-episodes', label: 'Morning/Evening', icon: Mic, color: 'text-amber-500' },
```

This requires `Mic` to be available from `lucide-react` — add `Mic` to the existing `import { ... } from 'lucide-react';` block at the top of `Dashboard.tsx`.

Add the conditional render block (same simple pattern as the `bible-verses` tab, since `AudioEpisodeManager` is self-contained and takes no props), placed near the `bible-verses` block:

```tsx
{/* Audio Episodes Tab */}
{
  activeTab === 'audio-episodes' && (
    <AudioEpisodeManager />
  )
}
```

- [ ] **Step 3: Typecheck**

Run (from `frontend/`): `npx tsc --noEmit -p . 2>&1 | grep -i "AudioEpisodeManager\|Dashboard.tsx"`
Expected: no output.

- [ ] **Step 4: Manual browser verification**

Start the dev server, log into `/dashboard` as `admin@biblelover.com` / `admin123`, click the new "Morning/Evening" sidebar tab, click "New Episode", fill the form, upload a cover image and an audio file (try both the Upload and Record tabs), save, and confirm the new row appears in the table with correct slot/date/status. Edit it, toggle Published off, save, confirm the status badge updates. Delete it, confirm it disappears.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/AudioEpisodeManager.tsx frontend/src/pages/Dashboard.tsx
git commit -m "$(cat <<'EOF'
Add AudioEpisodeManager admin UI, wire into Dashboard

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Frontend — `PlayerDesk` homepage section

**Files:**
- Create: `frontend/src/components/PlayerDesk.tsx`
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `useAudioEpisodes` (Task 8), `audioEpisodesAPI.likeEpisode`/`unlikeEpisode`.
- Produces: `<PlayerDesk />`, placed between `<HomeFeed />` and `<VerseDesk />` in `Home.tsx` (per the user's explicit placement instruction).

- [ ] **Step 1: Write `PlayerDesk.tsx`**

Two columns (Morning, Evening), each with one large card (latest) + one small card (next-latest), matching the "Coverage by Desk" reference structure and the site's existing amber/white card language:

```tsx
import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, Pause, Heart } from 'lucide-react';
import { useAudioEpisodes } from '../hooks/useAudioEpisodes';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const useInlinePlayer = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = (episode: AudioEpisode) => {
    if (playingId === episode.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(episode.audioUrl);
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    audio.play();
    setPlayingId(episode.id);
  };

  return { playingId, toggle };
};

const LikeButton: React.FC<{ episode: AudioEpisode }> = ({ episode }) => {
  const [likes, setLikes] = useState(episode.likes);
  const [isLiked, setIsLiked] = useState(() => localStorage.getItem(`liked:episode:${episode.id}`) === '1');
  const [busy, setBusy] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (isLiked) {
        const res = await audioEpisodesAPI.unlikeEpisode(episode.id);
        if (res.success && res.data) setLikes(res.data.likes);
        setIsLiked(false);
        localStorage.removeItem(`liked:episode:${episode.id}`);
      } else {
        const res = await audioEpisodesAPI.likeEpisode(episode.id);
        if (res.success && res.data) setLikes(res.data.likes);
        setIsLiked(true);
        localStorage.setItem(`liked:episode:${episode.id}`, '1');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={handleLike} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors">
      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} /> {likes}
    </button>
  );
};

const BigCard: React.FC<{ episode: AudioEpisode; playingId: string | null; onToggle: (e: AudioEpisode) => void }> = ({ episode, playingId, onToggle }) => (
  <Link to={`/players/${episode.id}`} className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
    <div className="relative h-40 bg-gray-100">
      <img src={episode.coverImage} alt={episode.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(episode); }}
        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white"
      >
        {playingId === episode.id ? <Pause className="w-4 h-4 text-gray-900" /> : <Play className="w-4 h-4 text-gray-900 ml-0.5" />}
      </button>
    </div>
    <div className="p-4">
      <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{episode.title}</h4>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{episode.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400">{formatDate(episode.episodeDate)}</span>
        <LikeButton episode={episode} />
      </div>
    </div>
  </Link>
);

const SmallCard: React.FC<{ episode: AudioEpisode }> = ({ episode }) => (
  <Link to={`/players/${episode.id}`} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors">
    <img src={episode.coverImage} alt={episode.title} className="w-12 h-12 rounded object-cover shrink-0" loading="lazy" />
    <div className="min-w-0">
      <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">{episode.title}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(episode.episodeDate)}</p>
    </div>
  </Link>
);

const DeskColumn: React.FC<{ label: string; slot: 'MORNING' | 'EVENING'; episodes: AudioEpisode[]; playingId: string | null; onToggle: (e: AudioEpisode) => void }> = ({ label, slot, episodes, playingId, onToggle }) => {
  const [big, small] = episodes;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-gray-900">{label}</h3>
        <Link to={`/players?slot=${slot.toLowerCase()}`} className="px-2.5 py-1 bg-gray-100 rounded-md text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-200 transition-colors">
          Desk <ChevronRight className="inline w-3 h-3" />
        </Link>
      </div>
      {big ? (
        <div className="space-y-3">
          <BigCard episode={big} playingId={playingId} onToggle={onToggle} />
          {small && <SmallCard episode={small} />}
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-center text-sm text-gray-400 bg-white border border-dashed border-gray-200 rounded-lg">
          No {label.toLowerCase()} episodes yet
        </div>
      )}
    </div>
  );
};

const PlayerDesk: React.FC = () => {
  const { episodes, hasLoaded } = useAudioEpisodes(20);
  const { playingId, toggle } = useInlinePlayer();

  const morning = useMemo(() => episodes.filter(e => e.slot === 'MORNING').slice(0, 2), [episodes]);
  const evening = useMemo(() => episodes.filter(e => e.slot === 'EVENING').slice(0, 2), [episodes]);

  if (hasLoaded && episodes.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-4 bg-amber-700 rounded-sm" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Player Desk</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">Morning &amp; Evening</h2>
            <p className="text-sm text-gray-500 mt-2">Short audio devotionals to start and close your day</p>
          </div>
          <Link
            to="/players"
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-md text-xs font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
          >
            All Episodes <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!hasLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DeskColumn label="Morning" slot="MORNING" episodes={morning} playingId={playingId} onToggle={toggle} />
            <DeskColumn label="Evening" slot="EVENING" episodes={evening} playingId={playingId} onToggle={toggle} />
          </div>
        )}
      </div>
    </section>
  );
};

export default PlayerDesk;
```

- [ ] **Step 2: Wire into `Home.tsx`**

Add the import:

```tsx
import PlayerDesk from '../components/PlayerDesk';
```

Place it between `<HomeFeed />` and `<VerseDesk />`:

```tsx
      <Hero />
      <HomeFeed />
      <PlayerDesk />
      <VerseDesk />
```

- [ ] **Step 3: Typecheck**

Run (from `frontend/`): `npx tsc --noEmit -p . 2>&1 | grep -i "PlayerDesk\|Home.tsx"`
Expected: no output.

- [ ] **Step 4: Manual browser verification**

With at least one published Morning and one Evening episode in the DB (create via the admin UI from Task 11), load `/` and confirm: the section renders between the blog feed and Verse of the Day, shows the correct episodes in each column, the play button toggles audio playback, and the like button increments and persists across a page reload (via `localStorage`).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/PlayerDesk.tsx frontend/src/pages/Home.tsx
git commit -m "$(cat <<'EOF'
Add PlayerDesk homepage section between blog feed and Verse of the Day

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: Frontend — `/players` archive page

**Files:**
- Create: `frontend/src/pages/Players.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `audioEpisodesAPI.getEpisodes` directly (paginated, not the cached homepage hook — an archive page wants fresh, page-by-page data, not a single cached snapshot).
- Produces: route `/players`, linked from `PlayerDesk`'s "All Episodes" and "Desk" links (Task 12) and from `PlayerDetail` (Task 14).

- [ ] **Step 1: Write `Players.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';
import SEO from '../components/SEO';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Players: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const slotParam = searchParams.get('slot');
  const slot = slotParam === 'morning' ? 'MORNING' : slotParam === 'evening' ? 'EVENING' : undefined;

  const [episodes, setEpisodes] = useState<AudioEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    audioEpisodesAPI.getEpisodes({ slot, page, limit: 12 }).then((response) => {
      if (response.success && response.data) {
        setEpisodes(response.data.episodes);
        setTotalPages(response.data.pagination.totalPages);
      }
      setLoading(false);
    });
  }, [slot, page]);

  const setFilter = (value: 'morning' | 'evening' | null) => {
    setPage(1);
    if (value) {
      setSearchParams({ slot: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <SEO title="Morning & Evening Episodes" description="Browse all morning and evening audio devotionals." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-6">All Episodes</h1>

        <div className="flex gap-3 mb-8">
          {[
            { label: 'All', value: null },
            { label: 'Morning', value: 'morning' as const },
            { label: 'Evening', value: 'evening' as const }
          ].map(tab => (
            <button
              key={tab.label}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition-colors ${
                (tab.value === null && !slotParam) || tab.value === slotParam
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />)}
          </div>
        ) : episodes.length === 0 ? (
          <p className="text-gray-500">No episodes found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map(episode => (
              <Link key={episode.id} to={`/players/${episode.id}`} className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                <div className="h-36 bg-gray-100">
                  <img src={episode.coverImage} alt={episode.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">{episode.slot}</span>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mt-1 mb-1">{episode.title}</h3>
                  <p className="text-[11px] text-gray-400">{formatDate(episode.episodeDate)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md text-xs font-bold ${p === page ? 'bg-amber-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Players;
```

- [ ] **Step 2: Add the route in `App.tsx`**

Add the lazy import (alphabetically near `Posts`):

```tsx
const Players = lazy(() => import('./pages/Players'));
```

Add the route (near `/posts`):

```tsx
<Route path="/players" element={
  <PageTransition>
    <Header />
    <Players />
    <Footer />
  </PageTransition>
} />
```

- [ ] **Step 3: Typecheck**

Run (from `frontend/`): `npx tsc --noEmit -p . 2>&1 | grep -i "Players.tsx\|App.tsx"`
Expected: no output.

- [ ] **Step 4: Manual browser verification**

Navigate to `/players`, confirm episodes load, the Morning/Evening/All filter tabs work and update the URL query string, and pagination controls appear once there are enough episodes.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Players.tsx frontend/src/App.tsx
git commit -m "$(cat <<'EOF'
Add /players archive page with slot filter and pagination

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Frontend — `/players/:id` detail page (player, like, comments)

**Files:**
- Create: `frontend/src/pages/PlayerDetail.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `audioEpisodesAPI.getEpisode/getComments/addComment/likeEpisode/unlikeEpisode`.
- Produces: route `/players/:id`, linked from `PlayerDesk` (Task 12) and `Players` (Task 13).

- [ ] **Step 1: Write `PlayerDetail.tsx`**

Structurally mirrors `BlogPost.tsx`'s comment section (same state shape, same guest form, same `refetchComments` pattern) plus the like button logic already used in Task 12's `LikeButton`, and a full `<audio controls>` player:

```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode, AudioComment } from '../services/api.d';
import SEO from '../components/SEO';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<AudioEpisode | null>(null);
  const [comments, setComments] = useState<AudioComment[]>([]);
  const [loading, setLoading] = useState(true);

  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const refetchComments = async () => {
    if (!id) return;
    const response = await audioEpisodesAPI.getComments(id);
    if (response.success && response.data) setComments(response.data.comments);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    audioEpisodesAPI.getEpisode(id).then((response) => {
      if (response.success && response.data) {
        setEpisode(response.data.episode);
        setLikeCount(response.data.episode.likes);
        setIsLiked(localStorage.getItem(`liked:episode:${id}`) === '1');
      }
      setLoading(false);
    });
    refetchComments();
  }, [id]);

  const handleLike = async () => {
    if (!id || isLiking) return;
    setIsLiking(true);
    try {
      if (isLiked) {
        const res = await audioEpisodesAPI.unlikeEpisode(id);
        if (res.success && res.data) setLikeCount(res.data.likes);
        setIsLiked(false);
        localStorage.removeItem(`liked:episode:${id}`);
      } else {
        const res = await audioEpisodesAPI.likeEpisode(id);
        if (res.success && res.data) setLikeCount(res.data.likes);
        setIsLiked(true);
        localStorage.setItem(`liked:episode:${id}`, '1');
      }
    } finally {
      setIsLiking(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingComment(true);
    try {
      await audioEpisodesAPI.addComment(id, { authorName, authorEmail, content: commentContent });
      setAuthorName('');
      setAuthorEmail('');
      setCommentContent('');
      setCommentSubmitted(true);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>;
  }

  if (!episode) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Episode not found.</div>;
  }

  return (
    <>
      <SEO title={episode.title} description={episode.description} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{episode.slot === 'MORNING' ? 'Morning Episode' : 'Evening Episode'}</span>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mt-2 mb-2">{episode.title}</h1>
        <p className="text-sm text-gray-400 mb-6">{formatDate(episode.episodeDate)}</p>

        <img src={episode.coverImage} alt={episode.title} className="w-full h-64 object-cover rounded-lg mb-6" />

        <audio controls src={episode.audioUrl} className="w-full mb-6" />

        <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">{episode.description}</p>

        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-colors ${
            isLiked ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          ♥ {likeCount} {isLiked ? 'Liked' : 'Like'}
        </button>

        {/* Comments */}
        <section className="mt-12">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">Comments ({comments.length})</h2>
          <div className="space-y-4 mb-10">
            {comments.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-semibold">
                    {c.authorName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{c.authorName}</div>
                      <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">No comments yet. Be the first to comment!</div>
            )}
          </div>

          {commentSubmitted ? (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 text-sm text-amber-800">
              Thanks! Your comment has been submitted and will appear once approved.
            </div>
          ) : (
            <form onSubmit={submitComment} className="space-y-5 bg-gray-50 border border-gray-200 p-5 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="commentName" className="block text-sm text-gray-700 mb-1">Name</label>
                  <input
                    id="commentName"
                    type="text"
                    required
                    autoComplete="name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="commentEmail" className="block text-sm text-gray-700 mb-1">Email</label>
                  <input
                    id="commentEmail"
                    type="email"
                    required
                    autoComplete="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="commentContent" className="block text-sm text-gray-700 mb-1">Comment</label>
                <textarea
                  id="commentContent"
                  rows={4}
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:opacity-50"
              >
                {isSubmittingComment ? 'Posting…' : 'Post Comment'}
              </button>
            </form>
          )}
        </section>
      </div>
    </>
  );
};

export default PlayerDetail;
```

- [ ] **Step 2: Add the route in `App.tsx`**

Add the lazy import (near `Players`):

```tsx
const PlayerDetail = lazy(() => import('./pages/PlayerDetail'));
```

Add the route (near `/players`):

```tsx
<Route path="/players/:id" element={
  <PageTransition>
    <Header />
    <PlayerDetail />
    <Footer />
  </PageTransition>
} />
```

- [ ] **Step 3: Typecheck**

Run (from `frontend/`): `npx tsc --noEmit -p .`
Expected: no errors anywhere in the project (this is the final task — a clean full-project typecheck confirms nothing upstream broke).

- [ ] **Step 4: Manual end-to-end browser verification**

1. As admin, create a Morning episode and an Evening episode (Task 11's UI).
2. On `/`, confirm `PlayerDesk` shows both.
3. Click through to `/players/:id` for one of them, confirm the audio player works, click Like, confirm the count increments and the button switches to "Liked".
4. Submit a comment as a guest; confirm the "awaiting approval" message shows and the comment does NOT appear in the list yet.
5. As admin, go to the Morning/Evening dashboard tab (or directly call `audioEpisodesAPI.getAdminComments({status:'pending'})` via devtools if no admin comment-moderation UI was built in this plan — note: this plan does not include a dedicated admin comment-moderation *UI* for audio comments, only the backend routes from Task 5; if the user wants a UI for this, mirroring `CommentsManager.tsx` is a natural follow-up task) — approve the comment via `curl` (same as Task 6's smoke test) and confirm it now appears on `/players/:id`.
6. Refresh `/players/:id`, confirm the like state persists (via `localStorage`) and the comment (once approved) still shows.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/PlayerDetail.tsx frontend/src/App.tsx
git commit -m "$(cat <<'EOF'
Add /players/:id detail page with player, like button, and comments

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
