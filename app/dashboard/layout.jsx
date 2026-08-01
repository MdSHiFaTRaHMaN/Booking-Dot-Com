'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#090D16] flex text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
