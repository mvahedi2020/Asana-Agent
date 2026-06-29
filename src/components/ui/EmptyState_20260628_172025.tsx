import React from 'react';
import { FileQuestion } from 'lucide-react';
interface EmptyStateProps { title: string; description: string; }
export const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
    <FileQuestion className="w-12 h-12 mb-4 opacity-50" />
    <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
    <p className="mt-2 text-sm">{description}</p>
  </div>
);
