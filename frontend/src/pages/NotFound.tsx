import React from 'react';
import AutoText from '../components/AutoText';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-transparent">
      <div className="text-center px-4">
        <h1 className="text-5xl font-serif text-gray-900 dark:text-white mb-4">404</h1>
        <AutoText as="p" className="text-gray-600 dark:text-gray-300 mb-8">The page you're looking for doesn't exist.</AutoText>
        <a href="/" className="text-amber-700 hover:underline"><AutoText>Go back home</AutoText></a>
      </div>
    </div>
  );
};

export default NotFound;


