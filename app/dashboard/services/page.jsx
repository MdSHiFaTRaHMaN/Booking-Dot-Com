'use client';

import React, { useEffect, useState } from 'react';
import { Scissors, ShoppingBag, Clock, Plus, Tag, X, Trash2, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ServicesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hair Care',
    price: '',
    durationMinutes: 60,
    bufferMinutes: 15,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500',
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success) setServices(data.services || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setFormData({
          title: '',
          description: '',
          category: 'Hair Care',
          price: '',
          durationMinutes: 60,
          bufferMinutes: 15,
          imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500',
        });
        fetchServices();
        setIsModalOpen(false);
      } else {
        setErrorMessage(data.error || 'Failed to create service.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id, title) => {
    if (!confirm(`Are you sure you want to delete service "${title}"?`)) return;

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchServices();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Scissors className="w-6 h-6 text-cyan-400" />
            Services Catalog & Shopify Integration
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Bookable service offerings synced with Shopify products and checkout line items
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading services catalog...</div>
      ) : services.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-[5px] border border-slate-800 space-y-3">
          <Scissors className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-slate-300 font-bold text-base">No Services Offered Yet</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Click 'Add Service' above to create bookable salon services.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((serv) => (
            <div
              key={serv._id}
              className="glass-panel rounded-[5px] border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 transition-all group relative"
            >
              <div>
                <div className="h-44 relative overflow-hidden bg-slate-800">
                  <img
                    src={serv.imageUrl || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500'}
                    alt={serv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-[5px]-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-emerald-400 text-xs font-bold">
                    ${serv.price?.toFixed(2)}
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-[5px] bg-slate-900/90 text-cyan-300 text-[10px] font-semibold flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {serv.category || 'General'}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-100 text-base">{serv.title}</h3>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteService(serv._id, serv.title)}
                        className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs transition-all cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{serv.description}</p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{serv.durationMinutes} mins</span>
                    </div>
                    <div className="text-[10px] text-slate-500">+{serv.bufferMinutes}m buffer</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Shopify Synced</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {serv.shopifyProductId ? serv.shopifyProductId.slice(-8) : 'Synced'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-[5px] border border-slate-800 space-y-4 bg-[#0c111d]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Scissors className="w-5 h-5 text-cyan-400" />
                Add New Service Offering
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

            <form onSubmit={handleAddServiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Service Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Signature Haircut & Styling"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Hair Care">Hair Care</option>
                    <option value="Hair Color">Hair Color</option>
                    <option value="Spa & Wellness">Spa & Wellness</option>
                    <option value="Nail & Beauty">Nail & Beauty</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="85.00"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Duration (Minutes) *</label>
                  <input
                    type="number"
                    name="durationMinutes"
                    required
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Buffer (Minutes)</label>
                  <input
                    type="number"
                    name="bufferMinutes"
                    value={formData.bufferMinutes}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Service description and details..."
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

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
                  <span>{submitting ? 'Creating Service...' : 'Create Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
