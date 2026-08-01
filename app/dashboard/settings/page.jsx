'use client';

import React, { useState } from 'react';
import { Settings, Key, Globe, Shield, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="w-6 h-6 text-cyan-400" />
          Settings & Integrations
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Shopify API secrets, webhook listeners, Cloudinary keys, and store scheduling parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-panel p-6 rounded-[5px] border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Globe className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Shopify API & Webhooks</h3>
              <p className="text-xs text-slate-400">Configure your Shopify Admin API & Draft Order connection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Shopify Store Domain</label>
              <input
                type="text"
                defaultValue="demo-salon-booking.myshopify.com"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Admin API Access Token</label>
              <input
                type="password"
                defaultValue="shpat_1234567890abcdef"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-300 font-semibold mb-1 block">Webhook Listening Endpoint</label>
              <div className="p-3 rounded-[5px] bg-slate-950 border border-slate-800 font-mono text-cyan-300 text-xs flex justify-between items-center">
                <span>https://your-domain.com/api/webhooks/shopify</span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase px-2 py-0.5 rounded-[5px] bg-emerald-500/10 border border-emerald-500/20">
                  Ready (200 OK)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[5px] border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Key className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Cloudinary Media Storage</h3>
              <p className="text-xs text-slate-400">Stores staff avatars and customer review photos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Cloud Name</label>
              <input
                type="text"
                defaultValue="demo_cloud"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">API Key</label>
              <input
                type="text"
                defaultValue="1234567890"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">API Secret</label>
              <input
                type="password"
                defaultValue="secretkey123"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
          >
            <Shield className="w-4 h-4" />
            Save Configuration
          </button>
          {saved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
