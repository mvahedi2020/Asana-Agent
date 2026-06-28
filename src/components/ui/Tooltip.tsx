import React from 'react';
export default function Tooltip({ children, text }: { children: React.ReactNode, text: string }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-xs text-zinc-100 opacity-0 transition-opacity group-hover:opacity-100">
        {text}
      </div>
    </div>
  );
}
