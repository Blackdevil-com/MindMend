import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFF] text-slate-900 selection:bg-brand-600 selection:text-white font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
