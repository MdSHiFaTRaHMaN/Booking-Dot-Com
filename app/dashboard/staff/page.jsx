'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Clock,
  Scissors,
  Percent,
} from 'lucide-react';

export default function StaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.success) setStaffList(data.staff || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-cyan-400" />
            Staff Roster & Work Shifts
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage service assignments, weekly working hours, and gratuity commission split
          </p>
        </div>

        <button
          onClick={() => alert('Staff member creation form modal opened!')}
          className="px-4 py-2.5 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading staff roster...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staffList.map((staff) => (
            <div
              key={staff._id}
              className="glass-panel p-6 rounded-[5px] border border-slate-800 space-y-6 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-14 h-14 rounded-[5px] object-cover border-2 border-cyan-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{staff.name}</h3>
                    <p className="text-xs text-cyan-400 font-medium">{staff.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{staff.email} • {staff.phone}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-[5px]-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                  {staff.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-[5px] border border-slate-800">
                {staff.bio || 'Professional service specialist at Luxe Salon.'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[5px] bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Percent className="w-3 h-3 text-cyan-400" /> Commission Rate
                  </div>
                  <div className="text-lg font-bold text-slate-100 mt-1">{staff.commissionRate || 15}%</div>
                </div>

                <div className="p-3 rounded-[5px] bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-emerald-400" /> Assigned Services
                  </div>
                  <div className="text-lg font-bold text-slate-100 mt-1">{staff.services?.length || 0} Services</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Working Shift Hours
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {staff.workingShifts?.slice(0, 4).map((shift, idx) => (
                    <div key={idx} className="p-2 rounded-[5px] bg-slate-950 border border-slate-800/80 text-center">
                      <div className="text-[10px] font-bold text-slate-400">{shift.day.slice(0, 3)}</div>
                      <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
                        {shift.isWorking ? `${shift.startTime}-${shift.endTime}` : 'OFF'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
