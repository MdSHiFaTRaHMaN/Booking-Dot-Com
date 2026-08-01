'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Clock,
  Scissors,
  Percent,
  X,
  Lock,
  Mail,
  User,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function StaffPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [staffList, setStaffList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    title: '',
    phone: '',
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    commissionRate: 15,
    selectedServices: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, servicesRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/services'),
      ]);
      const staffData = await staffRes.json();
      const servicesData = await servicesRes.json();

      if (staffData.success) setStaffList(staffData.staff || []);
      if (servicesData.success) setServicesList(servicesData.services || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const exists = prev.selectedServices.includes(serviceId);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((id) => id !== serviceId)
          : [...prev.selectedServices, serviceId],
      };
    });
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        title: formData.title,
        phone: formData.phone,
        bio: formData.bio,
        avatar: formData.avatar,
        commissionRate: Number(formData.commissionRate),
        services: formData.selectedServices,
      };

      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage('Staff member & login credentials created successfully!');
        setFormData({
          name: '',
          email: '',
          password: '',
          title: '',
          phone: '',
          bio: '',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
          commissionRate: 15,
          selectedServices: [],
        });
        fetchData();
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMessage('');
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Failed to create staff member.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!confirm(`Are you sure you want to remove staff member "${name}" and delete their login credentials?`)) return;

    try {
      const res = await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-cyan-400" />
            Staff Roster & Login Credentials
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage staff login accounts, service assignments, weekly working hours, and commission split
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading staff roster...</div>
      ) : staffList.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-[5px] border border-slate-800 space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-slate-300 font-bold text-base">No Staff Members Found</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Click 'Add Staff Member' above to create a staff member along with their login email and password.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staffList.map((staff) => (
            <div
              key={staff._id}
              className="glass-panel p-6 rounded-[5px] border border-slate-800 space-y-6 hover:border-cyan-500/40 transition-all relative group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={staff.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'}
                    alt={staff.name}
                    className="w-14 h-14 rounded-[5px] object-cover border-2 border-cyan-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{staff.name}</h3>
                    <p className="text-xs text-cyan-400 font-medium">{staff.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{staff.email} • {staff.phone || 'No Phone'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-[5px]-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                    {staff.status}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteStaff(staff._id, staff.name)}
                      className="p-1.5 rounded-[5px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-all opacity-80 hover:opacity-100 cursor-pointer"
                      title="Delete Staff & Credentials"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-[5px] border border-slate-800">
                {staff.bio || 'Professional service specialist.'}
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

      {/* Add Staff Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-xl p-6 rounded-[5px] border border-slate-800 space-y-4 bg-[#0c111d] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Add Staff Member & Login Credentials
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-[5px] text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-[5px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-[5px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {successMessage}
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Job Title / Role *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Master Stylist"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="p-4 rounded-[5px] bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Dashboard Login Credentials (for Staff)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-semibold mb-1 block">Login Email *</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="staff@bookingdotcom.com"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-[5px] focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold mb-1 block">Login Password *</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-[5px] focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 012-3456"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Commission Rate (%)</label>
                  <input
                    type="number"
                    name="commissionRate"
                    min={0}
                    max={100}
                    value={formData.commissionRate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Bio / Summary</label>
                <textarea
                  name="bio"
                  rows={2}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Specialization and background..."
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {servicesList.length > 0 && (
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block">Assign Services</label>
                  <div className="grid grid-cols-2 gap-2">
                    {servicesList.map((srv) => {
                      const isSelected = formData.selectedServices.includes(srv._id);
                      return (
                        <div
                          key={srv._id}
                          onClick={() => handleServiceToggle(srv._id)}
                          className={`p-2 rounded-[5px] border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate font-medium">{srv.title}</span>
                          <span className="text-[10px] font-mono">${srv.price?.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-[5px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <span>{submitting ? 'Creating Account...' : 'Save & Create Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
