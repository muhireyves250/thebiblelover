# Professional Bible Reader UI — Design

## Intent

The offline Bible reader (`/bible`, `/bible/:lang/:book/:chapter`, `/bible/search`)
works, but its UI is utilitarian: always-visible icon rows under every
verse, a separate page per book, no way to jump chapters without
backtracking. This redesigns the reading experience to feel like a
dedicated, trustworthy Bible app, on both phone and desktop, and makes
it the app's one clear Bible entry point instead of competing with the
older featured-verse nav item.

Decided interactively with the user via mockups (see conversation);
recorded here as the agreed direction.

## Non-goals

- Not redesigning the featured/daily-verse pages (`/verses`, `Home`'s
  featured section) — those stay as they are; this only changes what's
  reachable from primary navigation.
- Not adding a reading-settings panel (font size, theme toggle) — not
  asked for, deferred.
- Not adding multiple highlight colors — one accent color (amber,
  matching the site's existing brand) for now.

## Visual style — "Modern App"

Clean sans-serif (the site's existing system-font stack), generous
line-height, verse numbers as small superscript, selected/highlighted
verses shown with a soft amber background rather than a loud color
block. Matches the site's existing amber-700 accent — this is a polish
pass on the established brand, not a new one.

## Verse interaction

Tapping/clicking a verse selects it (soft highlight ring). A floating
toolbar appears — bottom-anchored on phone, inline near the verse on
desktop — with **Bookmark**, **Highlight**, **Note**, **Share**.
Tapping elsewhere, or tapping the selected verse again, deselects and
hides the toolbar. This replaces the always-visible per-verse icon row
entirely; nothing is shown until a verse is selected.

- **Bookmark** / **Highlight**: toggle immediately (existing
  `setBookmark`/`deleteBookmark`/`setHighlight`/`deleteHighlight` from
  `bibleOfflineDb`), toolbar reflects current state (filled vs outline
  icon).
- **Note**: opens a small sheet (bottom sheet on phone, popover anchored
  to the verse on desktop) with a text area + Save/Delete, backed by
  the existing `setNote`/`deleteNote`.
- **Share**: `navigator.share({ text, url })` when available; falls
  back to `navigator.clipboard.writeText` with a brief "Copied" toast
  when it isn't. Shares the verse reference, text, and a deep link to
  `/bible/:lang/:book/:chapter`.

## Navigation

**Chapter title is the nav trigger.** The chapter header ("Genesis 1")
is tappable/clickable anywhere, opening an overlay: a book grid
(grouped Old/New Testament, matching `BibleHome`'s existing grouping)
that drills into a chapter grid for the selected book. Picking a
chapter navigates and closes the overlay. This overlay is the only
navigation surface on phone.

**Chapter-to-chapter**: swipe left/right on phone (simple touch-based
threshold, no new gesture library — this repo has none and one chapter
screen doesn't need one), left/right arrow keys on desktop, in addition
to the existing prev/next chapter links at the bottom of the page
(kept, since they're already accessible and some readers prefer them
over swipe/keys).

**Desktop also gets a persistent left sidebar**: the same grouped book
list, current book expanded to show its chapter grid inline, always
visible at `md:` breakpoint and up. Clicking updates the reading pane
immediately — no overlay needed on desktop, though the same overlay
remains available (opened the same way, from the chapter title) as a
faster path than scrolling the sidebar for a distant book.

`BibleHome` (`/bible`) keeps its current role — the book-grid landing
page — unchanged; the overlay/sidebar are for switching *while already
reading*, not a replacement for the landing page.

## Primary navigation swap

Replace `/verses` (featured-verse archive) with `/bible` (the full
reader) as the Bible entry point everywhere it currently appears in
primary navigation:

- `MobileBottomNav.tsx`: the `Verses` tab becomes a `Bible` tab
  (`/bible`, same icon).
- `Header.tsx` desktop nav and mobile slide-out menu: the `/verses`
  entries are replaced by `/bible` (not added alongside — one entry,
  not two).

The `/verses` route, its page, and the home page's featured-verse
section are untouched and still reachable by direct link — they're
just no longer in the primary nav.

## What's left to the builder

- Exact swipe-distance threshold and animation easing.
- Exact popover positioning logic on desktop (clamping near viewport
  edges).
- Toast component for the share-link-copied fallback — use an existing
  one if this repo has a pattern, otherwise a minimal inline one.
