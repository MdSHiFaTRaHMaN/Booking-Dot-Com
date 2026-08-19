'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  DollarSign,
  HeartHandshake,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  User,
  Star,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DashboardOverview() {
  const { data: session } = useSession();
  const currentRole = session?.user?.role || 'ADMIN';
  const staffId = session?.user?.staffId;

  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, reviewsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/reviews'),
      ]);

      const bookingsData = await bookingsRes.json();
      const reviewsData = await reviewsRes.json();

      let allBookings = bookingsData.success ? bookingsData.bookings || [] : [];
      let allReviews = reviewsData.success ? reviewsData.reviews || [] : [];

      if (currentRole === 'STAFF' && staffId) {
        allBookings = allBookings.filter(
          (b) => (b.staffId?._id || b.staffId) === staffId
        );
        allReviews = allReviews.filter(
          (r) => (r.staffId?._id || r.staffId) === staffId
        );
      }

      setBookings(allBookings);
      setReviews(allReviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const totalTips = bookings.reduce((sum, b) => sum + (b.tipId?.amount || 0), 0);
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[5px] bg-gradient-to-r from-cyan-900/60 via-slate-900 to-slate-900 border border-cyan-500/20 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-[5px]-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px]-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Logged in as {session?.user?.name || 'User'} ({currentRole})
            </div>
            <h1 className="font-display text-4xl md:text-5xl tracking-wider leading-none heading-gradient uppercase">
              Salon & Spa Booking Hub
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xl">
              Track appointments from Shopify storefront, manage staff time slots, and collect post-service customer reviews and staff tips securely.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/products"
              className="px-5 py-3 rounded-[5px] bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs tracking-wide uppercase transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              Shopify Products
            </Link>
            <Link
              href="/dashboard/bookings"
              className="px-5 py-3 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Manage Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-[5px] border border-slate-800 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-400">Total Bookings</span>
            <div className="p-2.5 rounded-[5px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{bookings.length}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active bookings list</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[5px] border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-400">Total Revenue</span>
            <div className="p-2.5 rounded-[5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">${totalRevenue.toFixed(2)}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Processed via Shopify</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[5px] border border-slate-800 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-400">Staff Tips Collected</span>
            <div className="p-2.5 rounded-[5px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">${totalTips.toFixed(2)}</div>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Post-service gratuity</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[5px] border border-slate-800 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-400">Completion Rate</span>
            <div className="p-2.5 rounded-[5px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {bookings.length > 0 ? Math.round((completedCount / bookings.length) * 100) : 0}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>{completedCount} completed services</span>
          </div>
        </div>
      </div>

      {/* Appointments & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-[5px] border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Appointments List</h3>
              <p className="text-xs text-slate-400">Real-time status updates and review/tip links</p>
            </div>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View all ({bookings.length}) <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading appointments...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No appointments recorded in the system yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((b) => {
                const serviceTitle = b.serviceId?.title || 'Custom Service';
                const staffName = b.staffId?.name || 'Staff Member';

                return (
                  <div
                    key={b._id}
                    className="p-4 rounded-[5px] bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="px-3 py-2 rounded-[5px] bg-slate-800 text-cyan-400 text-center min-w-[70px]">
                        <Clock className="w-3.5 h-3.5 mx-auto mb-0.5" />
                        <span className="text-xs font-bold block">{b.startTime}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{b.date}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-200 text-sm">{b.customerName}</h4>
                          <span className="text-[11px] text-slate-400">{b.shopifyOrderNumber}</span>
                        </div>
                        <p className="text-xs text-cyan-300 font-medium">{serviceTitle}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <User className="w-3 h-3" /> Staff: {staffName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b._id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-[5px] border transition-all cursor-pointer bg-slate-950 ${
                          b.status === 'COMPLETED'
                            ? 'text-emerald-400 border-emerald-500/40'
                            : b.status === 'IN_PROGRESS'
                            ? 'text-amber-400 border-amber-500/40'
                            : 'text-cyan-400 border-cyan-500/40'
                        }`}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>

                      {b.status === 'COMPLETED' && (
                        <Link
                          href={`/review/${b._id}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-[5px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Review & Tip Link</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Recent Ratings & Reviews</h3>
                <p className="text-xs text-slate-400">Post-service customer feedback</p>
              </div>
              <div className="p-2 rounded-[5px] bg-amber-500/10 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No customer reviews submitted yet.</div>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((rev) => (
                  <div key={rev._id} className="p-4 rounded-[5px] bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs text-slate-200">{rev.customerName}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 italic mb-2">"{rev.comment}"</p>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                      <span>Staff: {rev.staffId?.name || 'Staff'}</span>
                      <span className="text-emerald-400 font-medium">Verified Customer</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link
              href="/review/demo"
              target="_blank"
              className="w-full py-3 rounded-[5px] bg-gradient-to-r from-amber-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs text-center flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <HeartHandshake className="w-4 h-4" />
              Open Customer Tip & Review Simulator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
