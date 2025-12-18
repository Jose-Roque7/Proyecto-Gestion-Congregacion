// app/dashboard/layout.tsx
'use client';

import Navbar from '../components/navbar';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Manejar detección de recargas
    const handleBeforeUnload = () => {
      sessionStorage.setItem('lastNavigationType', 'hard');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="bg-gray-50">
      <Navbar />
      <main className="mt-0">
        {children}
      </main>
    </div>
  );
}