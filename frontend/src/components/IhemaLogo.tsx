import React from 'react';

interface IhemaLogoProps {
  className?: string;
}

const IhemaLogo: React.FC<IhemaLogoProps> = ({ className = '' }) => (
  <img
    src="/images/logo.png"
    alt="Ihema - The Bible Lover"
    className={`h-8 md:h-10 w-auto object-contain select-none ${className}`}
  />
);

export default IhemaLogo;
