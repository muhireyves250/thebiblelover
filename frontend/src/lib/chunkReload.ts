// After a redeploy, a page left open (or opened via a stale cached link)
// still references the OLD content-hashed chunk filenames (e.g.
// Posts-Cl2iZZ3i.js), which no longer exist once the new build's assets
// replace them - any lazy-loaded route then fails with "Failed to fetch
// dynamically imported module". Vite fires `vite:preloadError` for
// exactly this case; the fix is a one-time hard reload to pick up the
// current build, guarded so a genuinely broken chunk doesn't reload
// forever. Shared between main.tsx (root safety net) and the routed
// content's own error boundary (so Header/Announcements/bottom nav can
// keep rendering around it instead of being replaced too).
const CHUNK_RELOAD_KEY = 'chunk-reload-attempted';

export const reloadForFreshBuild = () => {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return;
  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  window.location.reload();
};

export const isChunkLoadError = (error: Error | null | undefined) =>
  !!error && /failed to fetch dynamically imported module|error loading dynamically imported module/i.test(error.message);
