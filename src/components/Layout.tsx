import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="min-h-screen bg-stone-100 py-4 px-4 flex items-center justify-center">
      <div className={`w-full max-w-[430px] bg-white shadow-lg rounded-3xl overflow-hidden ${className}`}>
        {children}
      </div>
    </div>
  );
}
