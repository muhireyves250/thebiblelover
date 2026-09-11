import React from 'react';

interface IhemaLogoProps {
  className?: string;
}

const IhemaLogo: React.FC<IhemaLogoProps> = ({ className = '' }) => (
  <div
    className={`flex flex-col items-center justify-center rounded-xl bg-black px-4 py-2 leading-none select-none ${className}`}
  >
    <span
      className="font-display text-3xl md:text-4xl uppercase text-white leading-[0.8]"
      style={{ letterSpacing: '-0.06em' }}
    >
      Ihema
    </span>
    <span className="flex items-center justify-center gap-1.5 mt-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-white">
      <span>Bible</span>
      <span className="flex flex-col items-center">
        <span className="flex items-center gap-1">
          <span className="w-[1px] h-1.5 bg-white" />
          <span className="text-[6px] md:text-[7px] tracking-normal">The</span>
          <span className="w-[1px] h-1.5 bg-white" />
        </span>
        <span className="w-[2px] h-2 bg-white -mt-px" />
      </span>
      <span>Lover</span>
    </span>
  </div>
);

export default IhemaLogo;
