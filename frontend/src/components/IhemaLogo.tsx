import React from 'react';

interface IhemaLogoProps {
  className?: string;
}

const IhemaLogo: React.FC<IhemaLogoProps> = ({ className = '' }) => (
  <span className={`text-xl md:text-2xl font-serif text-gray-900 dark:text-gray-100 tracking-wide ${className}`}>
    IHEMA
  </span>
);

export default IhemaLogo;
