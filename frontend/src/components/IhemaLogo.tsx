import React from 'react';

interface IhemaLogoProps {
  className?: string;
}

const IhemaLogo: React.FC<IhemaLogoProps> = ({ className = '' }) => (
  <div
    className={`flex flex-col items-center justify-center rounded-xl bg-gray-950 px-4 py-2 leading-none select-none ${className}`}
  >
    <span className="font-display text-3xl md:text-4xl uppercase tracking-tight text-white leading-[0.8]">
      Ihema
    </span>
    <span className="flex items-center justify-center gap-2 mt-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-gray-200">
      <span>The</span>
      <svg viewBox="0 0 10 14" className="w-[7px] h-[11px] fill-current text-white" aria-hidden="true">
        <rect x="4" y="0" width="2" height="14" />
        <rect x="0" y="4" width="10" height="2" />
      </svg>
      <span>Bible Lover</span>
    </span>
  </div>
);

export default IhemaLogo;
