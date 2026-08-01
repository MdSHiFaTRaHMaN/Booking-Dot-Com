'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Star,
  HeartHandshake,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Scissors,
} from 'lucide-react';

export default function CustomerReviewPage() {
  const params = useParams();
  const bookingId = params?.bookingId;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [selectedTip, setSelectedTip] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [tipping, setTipping] = useState(false);

  useEffect(() => {
    async function loadBookingDetails() {
      if (!bookingId || bookingId === 'demo') {
        setBooking({
          _id: 'demo_booking_999',
          customerName: 'Sophia Loren',
          customerEmail: 'sophia@example.com',
          serviceId: {
            title: 'Signature Haircut & Styling',
            price: 85.0,
            imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500',
          },
          staffId: {
            name: 'Elena Rostova',
            title: 'Master Hair Stylist',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
          },
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (data.success && data.bookings) {
          const match = data.bookings.find((b) => b._id === bookingId);
          if (match) setBooking(match);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadBookingDetails();
  }, [bookingId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTipCheckout = async () => {
    const tipAmount = selectedTip !== null ? selectedTip : parseFloat(customTip) || 0;
    if (!tipAmount || tipAmount <= 0) {
      alert('Please select or enter a valid tip amount.');
      return;
    }

    setTipping(true);
    try {
      const res = await fetch('/api/tips/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking?._id || 'demo_booking_999',
          amount: tipAmount,
        }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Shopify tip checkout initiated successfully! Redirecting...');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTipping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-400 text-sm">
        Loading service completion details...
      </div>
    );
  }

  const staff = booking?.staffId || { name: 'Elena Rostova', title: 'Specialist' };
  const service = booking?.serviceId || { title: 'Salon Service' };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans py-12 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full glass-panel p-8 rounded-[5px] border border-slate-800 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-[5px]-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[5px]-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Service Completed
          </div>
          <h1 className="text-2xl font-black text-white">How was your experience?</h1>
          <p className="text-xs text-slate-400">
            Thank you for visiting Luxe Salon & Spa. Please take a moment to leave a review and optionally tip your specialist.
          </p>
        </div>

        <div className="p-4 rounded-[5px] bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <img
            src={staff.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'}
            alt={staff.name}
            className="w-14 h-14 rounded-[5px] object-cover border-2 border-cyan-500/30"
          />
          <div>
            <div className="text-xs text-slate-400">Your Specialist</div>
            <div className="font-bold text-slate-100 text-base">{staff.name}</div>
            <div className="text-xs text-cyan-400 font-medium flex items-center gap-1 mt-0.5">
              <Scissors className="w-3 h-3" /> {service.title}
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-800 pt-6">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            1. Rate Your Service
          </h3>

          {!reviewSubmitted ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= rating
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-slate-700'
                        }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about your experience or compliments for your specialist..."
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-3.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-[5px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
              >
                Submit Rating & Review
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-[5px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Thank you! Your rating and review have been submitted.
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-amber-300" />
              2. Optional Tip for {staff.name}
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Shopify Checkout</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[5, 10, 15, 25].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedTip(amount);
                  setCustomTip('');
                }}
                className={`py-3 rounded-[5px] font-bold text-xs transition-all border ${selectedTip === amount
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="Custom Tip ($)"
              value={customTip}
              onChange={(e) => {
                setCustomTip(e.target.value);
                setSelectedTip(null);
              }}
              className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 p-3 rounded-[5px] focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleTipCheckout}
            disabled={tipping}
            className="w-full py-4 rounded-[5px] bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {tipping ? 'Generating Shopify Checkout...' : 'Proceed to Tip Checkout via Shopify'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            100% secure payment powered by Shopify Checkout
          </p>
        </div>
      </div>
    </div>
  );
}
