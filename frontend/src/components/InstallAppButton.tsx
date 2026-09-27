import React, { useState } from 'react';
import { Download, Share, Menu } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

const InstallAppButton: React.FC = () => {
  const { canInstall, canInstallIOS, isInstalled, promptInstall } = usePwaInstall();
  const [showHelp, setShowHelp] = useState(false);

  const handleClick = async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }
    // iOS Safari and any other browser without a native install prompt
    // (desktop Firefox, in-app browsers, etc.) get manual instructions
    // instead of a button that would silently do nothing.
    setShowHelp(true);
  };

  if (isInstalled) return null;

  return (
    <div className="px-4 md:px-0">
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2.5 bg-amber-700 hover:bg-amber-800 text-white px-5 py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors shadow-sm"
      >
        <Download className="h-4 w-4" />
        Install Ihema App
      </button>

      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
          <div
            className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg shadow-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img src="/app-icon.png" alt="Ihema" className="w-14 h-14 rounded-xl mx-auto mb-4 object-cover" />
            <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">Install Ihema</h3>
            {canInstallIOS ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Tap the <Share className="h-3.5 w-3.5 inline align-text-bottom mx-0.5" /> Share icon in your browser's toolbar, then choose <span className="font-bold text-gray-900 dark:text-white">"Add to Home Screen"</span>.
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Open your browser's menu (<Menu className="h-3.5 w-3.5 inline align-text-bottom mx-0.5" /> usually top-right) and look for <span className="font-bold text-gray-900 dark:text-white">"Add to Home Screen"</span> or <span className="font-bold text-gray-900 dark:text-white">"Install App"</span>.
              </p>
            )}
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallAppButton;
