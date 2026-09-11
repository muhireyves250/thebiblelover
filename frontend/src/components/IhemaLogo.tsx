import React from 'react';

interface IhemaLogoProps {
  className?: string;
}

const IhemaLogo: React.FC<IhemaLogoProps> = ({ className = '' }) => (
  <span className={`inline-flex items-end leading-none select-none ${className}`}>
    <span className="relative flex flex-col items-center mr-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-700 dark:bg-amber-500 mb-0.5" />
      <span className="text-2xl md:text-3xl font-sans font-black text-amber-700 dark:text-amber-500 -tracking-tight">
        I
      </span>
    </span>
    <span className="text-xl md:text-2xl font-sans font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
      HE
    </span>
    <span className="text-xl md:text-2xl font-sans font-extrabold italic text-amber-700 dark:text-amber-500 tracking-tight -skew-x-6">
      MA
    </span>
  </span>
);

export default IhemaLogo;
