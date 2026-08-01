'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, DollarSign, HeartHandshake, TrendingUp, Users } from 'lucide-react';

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.success) {
        setReportsData(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalRevenue = reportsData?.totalRevenue || 0;
  const totalTips = reportsData?.totalTips || 0;
  const totalStaffPayouts = reportsData?.totalStaffPayouts || 0;
  const staffBreakdown = reportsData?.staffBreakdown || [];

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
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Monthly Service Revenue
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Calculated from live bookings</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-amber-400" /> Total Staff Gratuities (Tips)
          </div>
          <div className="text-3xl font-extrabold text-amber-300 mb-1">
            ${totalTips.toFixed(2)}
          </div>
          <div className="text-xs text-amber-400 font-medium">
            Processed via Shopify Checkout
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" /> Total Staff Payouts
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 mb-1">
            ${totalStaffPayouts.toFixed(2)}
          </div>
          <div className="text-xs text-cyan-400 font-medium">
            Commissions + Gratuities
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
        <h3 className="font-bold text-white text-base mb-4">Staff Performance & Earnings Breakdown</h3>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading performance metrics...</div>
        ) : staffBreakdown.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No staff payout data recorded yet.</div>
        ) : (
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
                {staffBreakdown.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-200">{row.name}</td>
                    <td className="p-3 text-slate-300">{row.completedServices} Services</td>
                    <td className="p-3 font-semibold text-emerald-400">${row.serviceRevenue.toFixed(2)}</td>
                    <td className="p-3 text-slate-400">{row.commissionRate}%</td>
                    <td className="p-3 font-semibold text-amber-300">${row.tipsEarned.toFixed(2)}</td>
                    <td className="p-3 font-bold text-cyan-300">${row.totalPayout.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
