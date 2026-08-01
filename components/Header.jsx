'use client';

import React, { useState } from 'react';
import { Bell, RefreshCw, Sparkles, ExternalLink, LogOut, UserCheck, Shield } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  const [clearing, setClearing] = useState(false);

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data and reset to default Admin?')) return;
    setClearing(true);
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  const user = session?.user || {
    name: 'Guest User',
    email: 'guest@example.com',
    role: 'STAFF',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };

  const isAdmin = user.role === 'ADMIN';

  return (
    <header className="h-20 border-b border-slate-800/60 glass-panel sticky top-0 z-30 px-8 flex items-center justify-between bg-[#0b0f17]/80">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Dashboard Portal
            <span className="text-xs px-2.5 py-0.5 rounded-[5px]-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              Live System
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time Shopify orders, MongoDB bookings & staff gratuity processing
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <button
            onClick={handleClearData}
            disabled={clearing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[5px] text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
            title="Clear all bookings, reviews, tips, and reset to clean Admin DB"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${clearing ? 'animate-spin' : ''}`} />
            <span>{clearing ? 'Clearing Data...' : 'Clear All Data'}</span>
          </button>
        )}

        <Link
          href="/review/demo"
          target="_blank"
          className="flex items-center gap-2 px-3.5 py-2 rounded-[5px] text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Review & Tip Portal</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </Link>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-[5px] bg-slate-700 overflow-hidden border border-slate-600">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>{user.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isAdmin
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{user.email}</div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-[5px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all ml-2 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
