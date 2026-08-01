'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Analytics & Performance Reports
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Revenue, gratuities, staff commissions, and Shopify sales breakdown
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">Monthly Service Revenue</div>
          <div className="text-3xl font-extrabold text-white mb-1">$4,280.00</div>
          <div className="text-xs text-emerald-400 font-medium">+18.5% compared to last month</div>
        </div>

        <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">Total Staff Gratuities (Tips)</div>
          <div className="text-3xl font-extrabold text-amber-300 mb-1">$645.00</div>
          <div className="text-xs text-amber-400 font-medium">100% processed via Shopify Checkout</div>
        </div>

        <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">Total Staff Payouts</div>
          <div className="text-3xl font-extrabold text-cyan-300 mb-1">$1,501.00</div>
          <div className="text-xs text-cyan-400 font-medium">Commissions + Gratuities</div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
        <h3 className="font-bold text-white text-base mb-4">Staff Performance & Earnings Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold bg-slate-900/40">
                <th className="p-3">Staff Name</th>
                <th className="p-3">Completed Services</th>
                <th className="p-3">Service Revenue</th>
                <th className="p-3">Commission Rate</th>
                <th className="p-3">Tips Earned</th>
                <th className="p-3">Total Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-slate-200">Elena Rostova</td>
                <td className="p-3 text-slate-300">28 Services</td>
                <td className="p-3 font-semibold text-emerald-400">$2,380.00</td>
                <td className="p-3 text-slate-400">20%</td>
                <td className="p-3 font-semibold text-amber-300">$390.00</td>
                <td className="p-3 font-bold text-cyan-300">$866.00</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-slate-200">Marcus Vance</td>
                <td className="p-3 text-slate-300">19 Services</td>
                <td className="p-3 font-semibold text-emerald-400">$1,900.00</td>
                <td className="p-3 text-slate-400">15%</td>
                <td className="p-3 font-semibold text-amber-300">$255.00</td>
                <td className="p-3 font-bold text-cyan-300">$540.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
