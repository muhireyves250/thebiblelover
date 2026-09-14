import React from 'react';

interface IhemaLogoProps {
  className?: string;
}

const IhemaLogo: React.FC<IhemaLogoProps> = ({ className = '' }) => (
  <>
    <img
      src="/images/logo.png"
      alt="Ihema - The Bible Lover"
      className={`h-11 md:h-14 w-auto object-contain select-none dark:hidden ${className}`}
    />
    <img
      src="/images/logo-dark.png"
      alt="Ihema - The Bible Lover"
      className={`h-14 md:h-[4.5rem] w-auto object-contain select-none hidden dark:block ${className}`}
    />
  </>
);

export default IhemaLogo;
