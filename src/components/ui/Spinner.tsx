import React from 'react';
export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  return (
    <div className={`animate-spin rounded-full border-b-2 border-indigo-500 ${sizeClass}`}></div>
  );
}
