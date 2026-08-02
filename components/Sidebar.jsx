'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Scissors,
  Star,
  BarChart3,
  Settings,
  ShoppingBag,
  Sparkles,
  Shield,
  UserCheck,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const currentRole = session?.user?.role || 'ADMIN';

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Shopify Products', href: '/dashboard/products', icon: ShoppingBag },
    { label: 'Booking Calendar', href: '/dashboard/calendar', icon: CalendarDays },
    { label: 'Bookings List', href: '/dashboard/bookings', icon: Calendar },
    { label: 'Services Catalog', href: '/dashboard/services', icon: Scissors },
    { label: 'Staff & Shifts', href: '/dashboard/staff', icon: Users },
    { label: 'Reviews & Tips', href: '/dashboard/reviews', icon: Star },
    { label: 'Reports & Analytics', href: '/dashboard/reports', icon: BarChart3, adminOnly: true },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings, adminOnly: true },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/60 flex flex-col justify-between h-screen sticky top-0 z-40 bg-[#0c111d]/90">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[5px] bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight">Shopify Booking</h1>
              <p className="text-xs text-cyan-400 font-medium">Luxe Salon & Spa</p>
            </div>
          </div>
        </div>

        {/* Current User Session Status */}
        <div className="px-4 py-3 mx-4 my-4 rounded-[5px] bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-300 font-medium">Role:</span>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-[5px] ${
              currentRole === 'ADMIN'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {currentRole}
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && currentRole !== 'ADMIN') return null;

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-[5px] text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Shopify & Logout */}
      <div className="p-4 m-3 space-y-3">
        <div className="rounded-[5px] bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 rounded-[5px] bg-emerald-500/20 text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-300">Shopify Store</div>
              <div className="text-[11px] text-slate-400">Connected & Synced</div>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-full animate-pulse"></div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full py-2.5 rounded-[5px] bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
