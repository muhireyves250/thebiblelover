import React from 'react';

const Toast: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center">
      <div className="bg-[#111113] text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">{message}</div>
    </div>
  );
};

export default Toast;
