'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';

function BookingFormContent() {
  const searchParams = useSearchParams();
  const productTitleParam = searchParams.get('title') || searchParams.get('product') || '';
  const priceParam = searchParams.get('price') || '';
  const productIdParam = searchParams.get('product_id') || '';

  // Data state
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form selections
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00');
  
  // Client details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // UI Flow
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const timeSlots = [
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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [servRes, staffRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/staff'),
        ]);

        const servData = await servRes.json();
        const staffData = await staffRes.json();

        let loadedServices = servData.success ? servData.services || [] : [];
        let loadedStaff = staffData.success ? staffData.staff || [] : [];

        setServices(loadedServices);
        setStaffList(loadedStaff);

        // Pre-select service if title match or default
        if (productTitleParam && loadedServices.length > 0) {
          const match = loadedServices.find(
            (s) => s.title.toLowerCase().includes(productTitleParam.toLowerCase())
          );
          if (match) {
            setSelectedService(match);
          } else {
            // Create fallback matching param object
            setSelectedService({
              _id: loadedServices[0]._id,
              title: productTitleParam,
              price: priceParam ? parseFloat(priceParam.replace(/,/g, '')) : loadedServices[0].price,
              durationMinutes: 60,
              description: 'Custom salon service requested from Shopify storefront.',
            });
          }
        } else if (loadedServices.length > 0) {
          setSelectedService(loadedServices[0]);
        }

        if (loadedStaff.length > 0) {
          setSelectedStaff(loadedStaff[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productTitleParam, priceParam]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      setErrorMessage('Please fill in your name and email address.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const orderNum = `#SHOPIFY-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        shopifyOrderId: `order_${Math.floor(10000 + Math.random() * 90000)}`,
        shopifyOrderNumber: orderNum,
        customerName,
        customerEmail,
        customerPhone,
        serviceId: selectedService?._id,
        staffId: selectedStaff?._id,
        date: selectedDate,
        startTime: selectedTimeSlot,
        endTime: calculateEndTime(selectedTimeSlot, selectedService?.durationMinutes || 60),
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        price: selectedService?.price || 85.0,
        notes,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setCompletedBooking(data.booking);
        setStep(4);
      } else {
        setErrorMessage(data.error || 'Failed to confirm booking.');
      }
    } catch (err) {
      setErrorMessage('An error occurred during booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  function calculateEndTime(start, duration) {
    const [h, m] = start.split(':').map(Number);
    const totalMinutes = h * 60 + m + duration;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090D16] text-slate-400 text-sm">
        Loading online booking portal...
      </div>
    );
  }

  if (completedBooking) {
    return (
      <div className="min-h-screen bg-[#090D16] py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg glass-panel p-8 rounded-[5px] border border-emerald-500/30 text-center space-y-6 bg-[#0c111d]">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/30">
              Appointment Confirmed!
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-3">
              Thank You, {completedBooking.customerName}!
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Your appointment order <span className="text-cyan-400 font-mono font-bold">{completedBooking.shopifyOrderNumber}</span> has been confirmed.
            </p>
          </div>

          <div className="p-4 rounded-[5px] bg-slate-900/80 border border-slate-800 text-left text-xs space-y-2 font-medium">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Service:</span>
              <span className="text-slate-200 font-bold">{selectedService?.title}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Staff Member:</span>
              <span className="text-cyan-400 font-bold">{selectedStaff?.name || 'Assigned Specialist'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Date & Time:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {completedBooking.date} at {completedBooking.startTime}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Amount Paid:</span>
              <span className="text-slate-100 font-bold text-sm">${completedBooking.price?.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={`/review/${completedBooking._id}`}
              target="_blank"
              className="w-full py-3 rounded-[5px] bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Post-Service Review & Staff Tip Portal
            </Link>

            <button
              onClick={() => {
                setCompletedBooking(null);
                setStep(1);
              }}
              className="w-full py-2.5 rounded-[5px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] py-10 px-4 text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Luxe Salon & Spa Online Reservations
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Book Your Appointment
          </h1>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Select your preferred salon service, specialist staff, date & time slot to complete your reservation.
          </p>
        </div>

        {/* Steps Progress */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-xs">
          <div
            className={`p-2.5 rounded-[5px] border text-center font-bold flex items-center justify-center gap-2 transition-all ${
              step === 1
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : step > 1
                ? 'bg-slate-900 border-slate-800 text-emerald-400'
                : 'bg-slate-950 border-slate-900 text-slate-600'
            }`}
          >
            <span>1. Service & Staff</span>
          </div>
          <div
            className={`p-2.5 rounded-[5px] border text-center font-bold flex items-center justify-center gap-2 transition-all ${
              step === 2
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : step > 2
                ? 'bg-slate-900 border-slate-800 text-emerald-400'
                : 'bg-slate-950 border-slate-900 text-slate-600'
            }`}
          >
            <span>2. Date & Time</span>
          </div>
          <div
            className={`p-2.5 rounded-[5px] border text-center font-bold flex items-center justify-center gap-2 transition-all ${
              step === 3
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-900 text-slate-600'
            }`}
          >
            <span>3. Client Details</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-[5px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center max-w-md mx-auto">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: SERVICE & STAFF SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-[5px] border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Scissors className="w-4 h-4 text-cyan-400" />
                Select Salon Service
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => {
                  const isSelected = selectedService?._id === srv._id || selectedService?.title === srv.title;
                  return (
                    <div
                      key={srv._id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-4 rounded-[5px] border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-100 text-sm">{srv.title}</h4>
                          <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            ${srv.price?.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-cyan-300">
                          <Clock className="w-3 h-3" /> {srv.durationMinutes} minutes
                        </span>
                        {isSelected && <span className="text-cyan-400 font-bold">Selected</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-[5px] border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Select Specialist Staff Member
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {staffList.map((st) => {
                  const isSelected = selectedStaff?._id === st._id;
                  return (
                    <div
                      key={st._id}
                      onClick={() => setSelectedStaff(st)}
                      className={`p-4 rounded-[5px] border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/60 shadow-md'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={st.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'}
                        alt={st.name}
                        className="w-10 h-10 rounded-[5px] object-cover border border-cyan-500/30"
                      />
                      <div>
                        <h4 className="font-bold text-slate-100 text-xs">{st.name}</h4>
                        <p className="text-[10px] text-cyan-400 font-medium">{st.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedService}
                className="px-6 py-3 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                <span>Continue to Date & Time</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DATE & TIME SELECTION */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-[5px] border border-slate-800 space-y-6">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Select Appointment Date
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono font-bold p-3 rounded-[5px] focus:outline-none focus:border-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Select Available Time Slot ({selectedDate})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-xs font-mono">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-3 rounded-[5px] border text-center font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-[5px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <span>Continue to Client Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CLIENT DETAILS & CHECKOUT */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel p-6 rounded-[5px] border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 pb-3 border-b border-slate-800">
                  <User className="w-4 h-4 text-cyan-400" />
                  Your Contact & Appointment Details
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold mb-1 block">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Sophia Loren"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-semibold mb-1 block">Email Address *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="sophia@example.com"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1 block">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+1 (555) 432-1098"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold mb-1 block">Special Requests / Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any preferences, allergies, or specific styling requests..."
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Summary Sidebar */}
              <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-bold text-white text-sm pb-3 border-b border-slate-800">
                    Booking Summary
                  </h3>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="p-3 rounded-[5px] bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Service</div>
                      <div className="font-bold text-cyan-400 mt-0.5">{selectedService?.title}</div>
                      <div className="text-slate-400 mt-0.5">{selectedService?.durationMinutes} mins</div>
                    </div>

                    <div className="p-3 rounded-[5px] bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Specialist</div>
                      <div className="font-bold text-slate-200 mt-0.5">{selectedStaff?.name || 'Any Specialist'}</div>
                    </div>

                    <div className="p-3 rounded-[5px] bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Date & Time</div>
                      <div className="font-bold text-emerald-400 font-mono mt-0.5">
                        {selectedDate} at {selectedTimeSlot}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-800">
                      <span className="text-slate-300">Total Price:</span>
                      <span className="text-emerald-400">${selectedService?.price?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-[5px] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span>{submitting ? 'Processing Booking...' : 'Confirm Appointment & Checkout'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-2 rounded-[5px] bg-slate-900 text-slate-400 text-xs font-semibold hover:text-slate-200"
                  >
                    Back to Date & Time
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PublicBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090D16] p-8 text-center text-slate-400 text-sm">Loading booking portal...</div>}>
      <BookingFormContent />
    </Suspense>
  );
}
