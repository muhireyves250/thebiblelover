// Bridges the service worker's update lifecycle (registered in main.tsx,
// outside the React tree) to the UpdateAvailableBanner component. main.tsx
// calls announceUpdateAvailable() once vite-plugin-pwa's onNeedRefresh
// fires; the banner subscribes and shows a "Refresh" button that calls
// applyUpdate() to activate the waiting worker and reload.
type Listener = () => void;

let pendingUpdate: ((reloadPage?: boolean) => Promise<void>) | null = null;
const listeners = new Set<Listener>();

export function announceUpdateAvailable(updateSW: (reloadPage?: boolean) => Promise<void>) {
  pendingUpdate = updateSW;
  listeners.forEach((listener) => listener());
}

export function subscribeToUpdateAvailable(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applyUpdate() {
  pendingUpdate?.(true);
}
