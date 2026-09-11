import React from 'react';

interface IhemaLogoProps {
  className?: string;
}

const IhemaLogo: React.FC<IhemaLogoProps> = ({ className = '' }) => (
  <span className={`inline-flex flex-col leading-none select-none ${className}`}>
    <span className="text-xl md:text-2xl font-sans font-extrabold tracking-tight">
      <span className="text-gray-900 dark:text-gray-100">IHE</span>
      <span className="text-amber-700 dark:text-amber-500">MA</span>
    </span>
  </span>
);

export default IhemaLogo;
