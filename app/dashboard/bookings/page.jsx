'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  ExternalLink,
  Star,
  HeartHandshake,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function BookingsListPage() {
  const { data: session } = useSession();
  const currentRole = session?.user?.role || 'ADMIN';
  const staffId = session?.user?.staffId;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        let bList = data.bookings || [];
        if (currentRole === 'STAFF' && staffId) {
          bList = bList.filter((b) => (b.staffId?._id || b.staffId) === staffId);
        }
        setBookings(bList);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentRole, staffId]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking(data.booking);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.customerEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.shopifyOrderNumber && b.shopifyOrderNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-6 h-6 text-cyan-400" />
            Bookings Directory
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage customer appointments, service completion, and review/tip checkout links
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search order #, customer, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 pl-9 pr-4 py-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-[5px]">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedBooking ? 'lg:col-span-2' : 'lg:col-span-3'} glass-panel rounded-[5px] border border-slate-800 overflow-hidden`}>
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading bookings directory...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No matching bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase bg-slate-900/40">
                    <th className="p-4 pl-6">Customer & Order</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Date & Slot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredBookings.map((b) => (
                    <tr
                      key={b._id}
                      onClick={() => setSelectedBooking(b)}
                      className={`hover:bg-slate-800/40 transition-all cursor-pointer ${
                        selectedBooking?._id === b._id ? 'bg-cyan-500/10' : ''
                      }`}
                    >
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-200">{b.customerName}</div>
                        <div className="text-[11px] text-slate-400">{b.customerEmail}</div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{b.shopifyOrderNumber || 'Shopify Direct'}</div>
                      </td>

                      <td className="p-4 font-semibold text-slate-300">
                        {b.serviceId?.title || 'Service'}
                        <div className="text-[10px] text-slate-400 font-normal">${b.price?.toFixed(2)}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={b.staffId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt="Staff"
                            className="w-6 h-6 rounded-[5px]-full object-cover"
                          />
                          <span className="font-medium text-slate-300">{b.staffId?.name || 'Staff'}</span>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-slate-300">
                        <div>{b.date}</div>
                        <div className="text-[10px] text-cyan-400">{b.startTime} - {b.endTime}</div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-[5px]-full text-[10px] font-bold border inline-block ${
                            b.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : b.status === 'IN_PROGRESS'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : b.status === 'CANCELLED'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(b);
                          }}
                          className="px-3 py-1.5 rounded-[5px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedBooking && (
          <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-[5px] cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="p-3 rounded-[5px] bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Customer</div>
                  <div className="font-bold text-slate-100 text-sm mt-0.5">{selectedBooking.customerName}</div>
                  <div className="text-slate-300 mt-0.5">{selectedBooking.customerEmail}</div>
                  {selectedBooking.customerPhone && (
                    <div className="text-slate-400 mt-0.5">{selectedBooking.customerPhone}</div>
                  )}
                </div>

                <div className="p-3 rounded-[5px] bg-slate-900/80 border border-slate-800 space-y-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Service</div>
                    <div className="font-bold text-cyan-400">{selectedBooking.serviceId?.title || 'Service'}</div>
                    <div className="text-slate-300 font-semibold">${selectedBooking.price?.toFixed(2)}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Staff Member</div>
                    <div className="font-bold text-slate-200">{selectedBooking.staffId?.name}</div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Update Booking Status
                  </label>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleStatusChange(selectedBooking._id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] font-semibold text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="p-3 rounded-[5px] bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5" /> Staff Tip Status
                    </span>
                    <span className="font-bold text-amber-300">
                      {selectedBooking.tipId?.amount ? `$${selectedBooking.tipId.amount.toFixed(2)} (${selectedBooking.tipId.status})` : 'No tip yet'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <Link
                href={`/review/${selectedBooking._id}`}
                target="_blank"
                className="w-full py-3 rounded-[5px] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
              >
                <Star className="w-4 h-4" />
                <span>Open Customer Review & Tip Page</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
