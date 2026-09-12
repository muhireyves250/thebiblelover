import React from 'react';
import { reloadForFreshBuild, isChunkLoadError } from '../lib/chunkReload';

// Catches a stale-deploy chunk-load failure ("Failed to fetch dynamically
// imported module") from just the routed page content, so the persistent
// site chrome around it (Header, Announcements, bottom nav) keeps
// rendering normally instead of being replaced by an error screen too.
// Triggers the same one-time hard reload as the root safety net in
// main.tsx, and shows a content-shaped skeleton while that happens.
class RouteErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Route error:', error, info);
    if (isChunkLoadError(error)) reloadForFreshBuild();
  }
  render() {
    if (this.state.hasError) {
      if (isChunkLoadError(this.state.error)) {
        return (
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
        );
      }
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', fontFamily: 'monospace' }}>
          <h2>Something went wrong loading this page.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default RouteErrorBoundary;
