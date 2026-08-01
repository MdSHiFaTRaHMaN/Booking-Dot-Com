'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Key, Globe, Shield, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    contactEmail: '',
    currency: 'USD',
    minLeadTimeHours: 2,
    maxAdvanceDays: 60,
    shopifyDomain: 'demo-salon-booking.myshopify.com',
    shopifyToken: 'shpat_demo_token_12345',
    cloudinaryCloudName: 'demo_cloud',
    cloudinaryApiKey: '1234567890',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setFormData((prev) => ({
          ...prev,
          ...data.settings,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="w-6 h-6 text-cyan-400" />
          Settings & System Configurations
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Shopify API secrets, webhook listeners, Cloudinary keys, and store scheduling parameters
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading system settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="glass-panel p-6 rounded-[5px] border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Globe className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-sm">Store & Shopify Parameters</h3>
                <p className="text-xs text-slate-400">Configure your store name, contact email, and Shopify API</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Store / Business Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Shopify Store Domain</label>
                <input
                  type="text"
                  name="shopifyDomain"
                  value={formData.shopifyDomain}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Admin API Access Token</label>
                <input
                  type="password"
                  name="shopifyToken"
                  value={formData.shopifyToken}
                  onChange={handleChange}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Cloud Name</label>
                <input
                  type="text"
                  name="cloudinaryCloudName"
                  value={formData.cloudinaryCloudName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">API Key</label>
                <input
                  type="text"
                  name="cloudinaryApiKey"
                  value={formData.cloudinaryApiKey}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-[5px] font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-[5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            {saved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
