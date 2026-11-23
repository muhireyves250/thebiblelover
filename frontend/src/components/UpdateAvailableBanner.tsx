import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { subscribeToUpdateAvailable, applyUpdate } from '../lib/pwaUpdate';
import AutoText from './AutoText';

const UpdateAvailableBanner = () => {
  const [available, setAvailable] = useState(false);

  useEffect(() => subscribeToUpdateAvailable(() => setAvailable(true)), []);

  if (!available) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 bg-gray-900 dark:bg-[#1c1c1f] text-white rounded-full pl-4 pr-1.5 py-1.5 shadow-2xl border border-white/10">
        <AutoText as="span" className="text-xs font-bold">A new version is available</AutoText>
        <button
          onClick={applyUpdate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-full text-xs font-black uppercase tracking-wide transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <AutoText as="span">Refresh</AutoText>
        </button>
      </div>
    </div>
  );
};

export default UpdateAvailableBanner;
