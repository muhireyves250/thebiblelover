import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <h1 className="text-5xl font-serif text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-8">The page you’re looking for doesn’t exist.</p>
        <a href="/" className="text-amber-700 hover:underline">Go back home</a>
      </div>
    </div>
  );
};

export default NotFound;


