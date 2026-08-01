'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [bookings, setBookings] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, staffRes] = await Promise.all([
        fetch(`/api/bookings?date=${selectedDate}`),
        fetch('/api/staff'),
      ]);
      const bData = await bookingsRes.json();
      const sData = await staffRes.json();

      if (bData.success) setBookings(bData.bookings || []);
      if (sData.success) setStaffList(sData.staff || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const hours = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  const filteredStaff = selectedStaff === 'ALL'
    ? staffList
    : staffList.filter((s) => s._id === selectedStaff);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-cyan-400" />
            Booking Calendar Schedule
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Visual staff timeline grid & hourly slot reservations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-[5px]">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-[5px] hover:bg-slate-800 text-slate-300 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer"
            />
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-[5px] hover:bg-slate-800 text-slate-300 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-[5px]">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Staff Members</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-[5px] border border-slate-800 overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading calendar grid...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No staff members found.</div>
        ) : (
          <div className="min-w-[800px]">
            <div className="grid grid-cols-10 border-b border-slate-800 pb-4 mb-4 text-xs font-bold text-slate-400">
              <div className="col-span-2 text-slate-500 uppercase tracking-wider">Staff Member</div>
              {hours.map((hour) => (
                <div key={hour} className="text-center font-mono text-cyan-400">
                  {hour}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {filteredStaff.map((staff) => {
                const staffBookings = bookings.filter((b) => (b.staffId?._id || b.staffId) === staff._id);

                return (
                  <div
                    key={staff._id}
                    className="grid grid-cols-10 items-center p-3 rounded-[5px] bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all"
                  >
                    <div className="col-span-2 flex items-center gap-3 pr-2">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-10 h-10 rounded-[5px] object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-200">{staff.name}</div>
                        <div className="text-[10px] text-cyan-400 truncate max-w-[130px]">{staff.title}</div>
                      </div>
                    </div>

                    {hours.map((hour) => {
                      const bookingInSlot = staffBookings.find(
                        (b) => b.startTime.startsWith(hour.slice(0, 2)) || b.startTime === hour
                      );

                      return (
                        <div key={hour} className="px-1 py-2">
                          {bookingInSlot ? (
                            <div
                              className={`p-2 rounded-[5px] text-[11px] font-semibold border transition-all cursor-pointer shadow-md ${bookingInSlot.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : bookingInSlot.status === 'IN_PROGRESS'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                }`}
                              title={`${bookingInSlot.customerName} - ${bookingInSlot.serviceId?.title || 'Service'}`}
                            >
                              <div className="truncate font-bold">{bookingInSlot.customerName}</div>
                              <div className="text-[9px] opacity-80 truncate">
                                {bookingInSlot.serviceId?.title || 'Service'}
                              </div>
                            </div>
                          ) : (
                            <div className="h-10 rounded-[5px] border border-dashed border-slate-800/60 bg-slate-950/30 hover:border-cyan-500/30 flex items-center justify-center transition-all group">
                              <span className="text-[10px] text-slate-600 group-hover:text-cyan-400 font-mono">
                                Available
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
