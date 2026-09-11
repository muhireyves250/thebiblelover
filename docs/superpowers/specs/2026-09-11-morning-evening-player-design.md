# Morning/Evening Player — Design Spec

## Summary

A new content type: short audio devotionals ("episodes") an admin either
uploads or records in-browser, tagged as a Morning or Evening episode with a
cover photo, description, and a date. Visitors see them on the homepage
(between the blog feed and Verse of the Day), can browse a full archive, play
audio, like an episode, and leave a guest comment that goes through the same
moderation queue as blog comments.

## Placement

New `PlayerDesk` section sits in `frontend/src/pages/Home.tsx` between
`<HomeFeed />` and `<VerseDesk />`.

## Data model (`api/prisma/schema.prisma`)

New, self-contained models — not extending `BlogPost`/`Comment`/`Like`, whose
foreign keys are hard-wired to blog posts.

```prisma
model AudioEpisode {
  id            String        @id @default(cuid())
  title         String
  description   String
  audioUrl      String
  coverImage    String
  slot          String        // "MORNING" | "EVENING"
  episodeDate   DateTime      // admin-picked date; drives sort order and "Today" badge
  likes         Int           @default(0)
  isPublished   Boolean       @default(true)
  authorId      String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  author        User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments      AudioComment[]

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

`User` gains an `audioEpisodes AudioEpisode[]` back-relation, matching the
existing `author`/`blogPosts` pattern.

Likes are a plain counter, incremented/decremented anonymously with no dedup
— matching the existing `BlogPost.likes` behavior for anonymous users (see
`api/routes/blog.js` `/like`/`/unlike` with `optionalAuth`). No `Like` join
table for audio episodes; this is consistent with how the app already treats
anonymous blog likes and avoids adding user-tracking machinery this feature
doesn't need.

`Media.folder` gains a new value: `'audio'` (existing field, just a new
string value — no schema change).

## Uploads (`api/middleware/upload.js`, `api/routes/upload.js`)

- New multer config `uploadAudio`: field name `audio`, memory storage,
  mimetype filter for `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/ogg`,
  `audio/webm`, `audio/mp4`, `audio/x-m4a`, 50MB limit (matches `uploadVideo`'s
  size ceiling — voice notes are short but recorded audio can run large at
  high sample rates).
- New route `POST /upload/audio` (`verifyToken`, `requireAdmin`): same
  buffer → Cloudinary `upload_stream` → fallback-to-disk pattern as
  `POST /upload/video`, with `resource_type: 'video'` (Cloudinary's audio
  handling) and `folder: 'bible-project/audio'`. Inserts a `Media` row with
  `folder: 'audio'`, same bookkeeping as image/video uploads.
- Served through `GET /upload/audio/:filename`, same `Media`-lookup-then-
  disk-fallback pattern as the existing image/video serving routes.
- In-browser recording (admin side) uses `MediaRecorder` to produce a
  `Blob` (webm/opus), which is then submitted to this same upload endpoint
  as a `File` — no separate backend path for "recorded" vs "uploaded" audio.

## Backend routes (`api/routes/audio-episodes.js`, mounted at `/api/audio-episodes`)

Admin (`verifyToken`, `requireAdmin`):
- `GET /admin` — list all episodes (incl. unpublished), filterable by `slot`.
- `POST /` — create (`title`, `description`, `audioUrl`, `coverImage`, `slot`,
  `episodeDate`, `isPublished`). `episodeDate` defaults to `new Date()` if
  omitted — same fix pattern just applied to `bible-verses.js`, so an episode
  posted with no explicit date still becomes "today's".
- `PATCH /:id` — update; coerces `episodeDate` to `Date` when present.
- `DELETE /:id` — delete (also deletes the Cloudinary audio/cover assets via
  their stored `Media.publicId`, matching how blog post images are cleaned
  up on delete, if that cleanup exists — otherwise left for a later pass).
- `GET /admin/:id/comments`, `PUT /admin/comments/:commentId/approve`,
  `DELETE /admin/comments/:commentId` — mirrors `CommentsManager`'s blog
  comment moderation routes exactly, scoped to `AudioComment`.

Public:
- `GET /` — published episodes, `?slot=MORNING|EVENING` optional filter,
  paginated (`limit`/`page`), ordered by `episodeDate desc`.
- `GET /:id` — single episode.
- `POST /:id/like` / `POST /:id/unlike` — `optionalAuth`, increments/
  decrements `likes` counter (same semantics as blog post likes).
- `GET /:id/comments` — only `isApproved: true`.
- `POST /:id/comments` — guest `authorName`/`authorEmail`/`content`, created
  with `isApproved: false`.

Joi validation schemas added to `api/middleware/validation.js`
(`validateAudioEpisode`, `validateAudioEpisodeUpdate`, `validateAudioComment`),
following the existing `validateBibleVerse`/`validateBlogPost` shape.

## Admin UI (`frontend/src`)

- `components/AudioEpisodeManager.tsx` — presentational table (cover thumb,
  title, slot badge, date, likes, comment count, published toggle, edit/
  delete actions), mirrors `PostsManager.tsx`'s props-driven structure (no
  internal API calls — state/handlers passed from `Dashboard.tsx`).
- `components/AddAudioEpisodeModal.tsx` / `EditAudioEpisodeModal.tsx` — form
  fields: title, description (textarea), cover image (reuses the existing
  `ImageUpload` component — immediate Cloudinary upload on file select,
  stores the resulting URL), slot (select: Morning/Evening), date
  (`type="date"` input), and an audio source picker with two tabs:
  - **Upload**: `<input type="file" accept="audio/*">` → posts to
    `uploadAPI.uploadAudio`, stores returned URL in `formData.audioUrl`.
  - **Record**: `MediaRecorder`-based Start/Stop/Preview/Re-record controls;
    on stop, the recorded `Blob` is immediately posted through the same
    `uploadAPI.uploadAudio` call as the upload tab, then previewed via
    `<audio controls>`.
- `Dashboard.tsx`: new sidebar entry, `{ id: 'audio-episodes', label:
  'Morning/Evening', icon: <appropriate lucide icon>, color: ... }`, plus a
  conditional render block mounting `AudioEpisodeManager` — same wiring
  pattern as the existing `bible-verses` tab.
- `services/api.d.ts` / `api.ts`: new `AudioEpisodesAPI` interface +
  implementation (`getEpisodes`, `getEpisode`, `createEpisode`,
  `updateEpisode`, `deleteEpisode`, `likeEpisode`, `unlikeEpisode`,
  `getComments`, `addComment`, plus admin comment moderation methods),
  registered in the `apis` aggregate; `uploadAPI`/`UploadAPI` gains
  `uploadAudio(file)`.

## Public UI (`frontend/src`)

- `components/PlayerDesk.tsx` — homepage section between `HomeFeed` and
  `VerseDesk`. Styled after the "Coverage by Desk" reference: two columns
  (Morning, Evening), each with a small "→" link pill to the filtered
  archive (`/players?slot=morning`), one large card (latest episode in that
  slot: cover photo with a play-button overlay, title, description excerpt,
  date, like count) and one small card below it (next-latest: thumbnail +
  title + date). Top-right "All Episodes" link to `/players`. The inline
  play button toggles a lightweight `<audio>` element scoped to that card
  (play/pause, no separate route needed for quick listening); the like
  button posts to `likeEpisode`/`unlikeEpisode` and optimistically updates
  the count, matching existing like-button patterns elsewhere in the app.
  Data fetched via a new `hooks/useAudioEpisodes.ts` (`useCachedFetch`,
  same stale-while-revalidate pattern as `useHomeFeed`/`useVerseArchive`).
- `pages/Players.tsx` — archive page at `/players`, filter tabs (All /
  Morning / Evening), paginated grid of cards (same card component as the
  homepage's small card), each linking to its detail page.
- `pages/PlayerDetail.tsx` — detail page at `/players/:id`: cover photo,
  full `<audio controls>` player, title, description, date, like button,
  comment list (approved only) + guest comment form (name, email, content)
  — structurally mirrors `pages/BlogPost.tsx`'s comment section.
- `App.tsx`: two new routes, `/players` and `/players/:id`.

## Testing

- Backend: `node --check` on new/edited files; manual `curl` smoke tests for
  create (verify `episodeDate` defaults to now), update, like/unlike,
  comment create + admin approve, matching the verification approach already
  used for the Bible verse `displayDate` fix.
- Frontend: manual browser walkthrough — admin creates an episode via both
  upload and in-browser recording, confirm it appears in the correct
  Morning/Evening column on the homepage and in `/players`; submit a guest
  comment, confirm it's hidden until approved via the admin moderation UI;
  click like, confirm the count updates.

## Out of scope (YAGNI, can follow up later if needed)

- No per-user like dedup (matches existing anonymous blog-like behavior).
- No draft/scheduling workflow beyond the existing `isPublished` boolean and
  `episodeDate` (no "publish in the future" distinct from post date, unlike
  blog's `publishedAt` scheduling — can be added later following that
  pattern if requested).
- No waveform visualization or audio duration display.
