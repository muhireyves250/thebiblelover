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
  }
  render() {
    if (this.state.hasError) {
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
