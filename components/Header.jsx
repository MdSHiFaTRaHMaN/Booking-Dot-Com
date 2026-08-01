'use client';

import React, { useState } from 'react';
import { Bell, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Header({ currentRole, onSeedTrigger }) {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="h-20 border-b border-slate-800/60 glass-panel sticky top-0 z-30 px-8 flex items-center justify-between bg-[#0b0f17]/80">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Dashboard Portal
            <span className="text-xs px-2.5 py-0.5 rounded-[5px]-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              JS Edition v1.0
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time Shopify orders, MongoDB bookings & staff gratuity processing
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-3.5 py-2 rounded-[5px] text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
          title="Reset and seed sample bookings, services, and staff"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Seeding Data...' : 'Reset Demo Data'}</span>
        </button>

        <Link
          href="/review/demo"
          target="_blank"
          className="flex items-center gap-2 px-3.5 py-2 rounded-[5px] text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Test Review & Tip Flow</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </Link>

        <div className="relative">
          <button className="p-2.5 rounded-[5px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-[5px]-full bg-cyan-400 animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-[5px]-full bg-cyan-400"></span>
          </button>
        </div>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-[5px] bg-slate-700 overflow-hidden border border-slate-600">
            <img
              src={
                currentRole === 'ADMIN'
                  ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
                  : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
              }
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-slate-200">
              {currentRole === 'ADMIN' ? 'Sarah Jenkins' : 'Elena Rostova'}
            </div>
            <div className="text-[11px] text-slate-400">{currentRole === 'ADMIN' ? 'System Administrator' : 'Staff Member'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
