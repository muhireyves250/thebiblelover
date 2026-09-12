import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './hooks/useAPI';
import App from './App';
import './index.css';

console.log('Main.tsx is starting');

// Dark mode UI is removed for now (light mode first, dark mode revisited
// later) - clear any 'dark' class/preference a previous session's now-
// deleted theme toggle may have left behind, so the site always renders
// in light mode regardless of prior local state or OS preference.
document.documentElement.classList.remove('dark');
try {
  localStorage.setItem('theme', 'light');
} catch {
  // ignore (e.g. storage disabled)
}

import React from 'react';

// After a redeploy, a page left open (or opened via a stale cached link)
// still references the OLD content-hashed chunk filenames (e.g.
// Posts-Cl2iZZ3i.js), which no longer exist once the new build's assets
// replace them - any lazy-loaded route then fails with "Failed to fetch
// dynamically imported module". Vite fires `vite:preloadError` for
// exactly this case; the fix is a one-time hard reload to pick up the
// current build, guarded so a genuinely broken chunk doesn't reload
// forever.
const CHUNK_RELOAD_KEY = 'chunk-reload-attempted';
const reloadForFreshBuild = () => {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return;
  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  window.location.reload();
};
window.addEventListener('vite:preloadError', reloadForFreshBuild);

const isChunkLoadError = (error: Error | null) =>
  !!error && /failed to fetch dynamically imported module|error loading dynamically imported module/i.test(error.message);

class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Global Catch:", error, info);
    if (isChunkLoadError(error)) reloadForFreshBuild();
  }
  render() {
    if (this.state.hasError) {
      if (isChunkLoadError(this.state.error)) {
        return (
          <div className="min-h-screen bg-white">
            <div className="h-16 border-b border-gray-200 flex items-center px-4 sm:px-6 lg:px-10">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
              <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-40 bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Something went wrong in the app!</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <GlobalErrorBoundary>
        <HelmetProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </HelmetProvider>
      </GlobalErrorBoundary>
    </StrictMode>
  );
  console.log('Render initialized with Providers');
} else {
  console.error('CRITICAL: Root container not found!');
}

// A previous version of this app registered a cache-first service worker
// that, on every redeploy, left returning visitors stuck loading a stale
// index.html referencing deleted (content-hashed) JS/CSS files. We no
// longer register one — this actively unregisters any leftover
// installation and clears its caches so those visitors recover.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    }).catch(() => {});

    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(key => caches.delete(key))).catch(() => {});
    }
  });
}
