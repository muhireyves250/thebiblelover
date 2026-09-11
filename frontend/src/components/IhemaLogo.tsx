import React from 'react';

interface IhemaLogoProps {
  className?: string;
}

const IhemaLogo: React.FC<IhemaLogoProps> = ({ className = '' }) => (
  <div className={`flex flex-col leading-none select-none ${className}`}>
    <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-[0.85]">
      Ihema
    </span>
    <span className="flex items-center justify-center gap-1.5 mt-1 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
      <span>The</span>
      <svg viewBox="0 0 10 14" className="w-2 h-3 fill-current text-amber-700" aria-hidden="true">
        <rect x="4" y="0" width="2" height="14" />
        <rect x="0" y="4" width="10" height="2" />
      </svg>
      <span>Bible Lover</span>
    </span>
  </div>
);

export default IhemaLogo;
