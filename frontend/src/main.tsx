import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './hooks/useAPI';
import App from './App';
import './i18n';
import './index.css';

console.log('Main.tsx is starting');

// Apply the saved theme before React mounts, so the page never flashes
// light before ThemeToggle's own effect catches up. Light is the
// default whenever nothing's been saved yet - this does not follow the
// OS preference.
try {
  const stored = localStorage.getItem('theme');
  document.documentElement.classList.toggle('dark', stored === 'dark');
} catch {
  // ignore (e.g. storage disabled)
}

import React from 'react';
import { reloadForFreshBuild, isChunkLoadError } from './lib/chunkReload';

// A chunk-load failure that happens INSIDE the routed content is caught
// lower down, by App.tsx's own RouteErrorBoundary, so Header/
// Announcements/bottom nav keep rendering around it. This root listener
// is only a safety net for a preload failure that fires before React
// even gets a chance to mount (or outside any component tree).
window.addEventListener('vite:preloadError', reloadForFreshBuild);

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
        return null;
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
// index.html referencing deleted (content-hashed) JS/CSS files, since it
// had no cache-busting of its own. vite-plugin-pwa's generated worker
// (registered below) precaches by content hash and cleans up outdated
// caches on activation, so a redeploy doesn't repeat that failure, and
// the Bible reader needs it to make the app work fully offline from the
// first launch after install.
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });
