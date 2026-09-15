import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

const DISMISSED_KEY = 'pwa-install-dismissed';

const InstallPwaCard: React.FC = () => {
  const { canInstall, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (!canInstall || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // ignore (e.g. storage disabled)
    }
  };

  return (
    <div className="px-4 md:px-0">
      <div className="relative bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 flex items-center gap-3">
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <img
          src="/app-icon.png"
          alt="The Bible Lover app icon"
          className="w-12 h-12 rounded-xl shrink-0 object-cover"
        />
        <div className="min-w-0 flex-1 pr-6">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Install The Bible Lover</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add it to your home screen for quick, full-screen access.</p>
        </div>
        <button
          onClick={promptInstall}
          className="shrink-0 flex items-center gap-1.5 bg-amber-700 text-white px-3.5 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallPwaCard;
