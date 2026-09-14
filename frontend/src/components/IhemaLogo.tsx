import React from 'react';

interface IhemaLogoProps {
  className?: string;
}

const IhemaLogo: React.FC<IhemaLogoProps> = ({ className = '' }) => (
  <img
    src="/images/logo.png"
    alt="Ihema - The Bible Lover"
    className={`h-11 md:h-14 w-auto object-contain select-none dark:hidden ${className}`}
  />
);

export default IhemaLogo;
