'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';

export default function DashboardLayout({ children }) {
  const [role, setRole] = useState('ADMIN');

  const toggleRole = () => {
    setRole((prev) => (prev === 'ADMIN' ? 'STAFF' : 'ADMIN'));
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex text-slate-100 font-sans">
      <Sidebar currentRole={role} onRoleToggle={toggleRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={role} />
        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
