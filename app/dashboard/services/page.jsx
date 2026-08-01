'use client';

import React, { useEffect, useState } from 'react';
import { Scissors, ShoppingBag, Clock, Plus, Tag } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Scissors className="w-6 h-6 text-cyan-400" />
            Services & Shopify Catalog
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Bookable service offerings synced with Shopify products and checkout line items
          </p>
        </div>

        <button
          onClick={() => alert('New service form opened!')}
          className="px-4 py-2.5 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((serv) => (
            <div
              key={serv._id}
              className="glass-panel rounded-[5px] border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
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
                  <h3 className="font-bold text-slate-100 text-base">{serv.title}</h3>
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
    </div>
  );
}
