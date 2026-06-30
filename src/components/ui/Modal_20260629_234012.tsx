import { ReactNode } from 'react';
export const Modal = ({ isOpen, children }: { isOpen: boolean, children: ReactNode }) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">{children}</div>;
};
