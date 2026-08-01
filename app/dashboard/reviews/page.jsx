'use client';

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            Customer Reviews & Staff Tips Hub
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Post-service customer ratings, photos, and staff tip checkout reconciliation
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-[5px]">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-lg font-bold text-white">{averageRating} / 5.0</span>
          <span className="text-xs text-slate-400">({reviews.length} reviews)</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading reviews...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="glass-panel p-6 rounded-[5px] border border-slate-800 space-y-4 hover:border-amber-500/40 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{rev.customerName}</h3>
                  <div className="text-xs text-cyan-400 mt-0.5">
                    Service: {rev.serviceId?.title || 'Salon Service'}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-[5px] border border-slate-800">
                "{rev.comment || 'No comment provided.'}"
              </p>

              {rev.photos && rev.photos.length > 0 && (
                <div className="flex gap-2 pt-2">
                  {rev.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt="Review attachment"
                      className="w-16 h-16 rounded-[5px] object-cover border border-slate-700"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                <span>Staff: {rev.staffId?.name || 'Staff Member'}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Approved
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
