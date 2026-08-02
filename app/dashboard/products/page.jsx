'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Scissors,
  Users,
  Tag,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ShopifyProductsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [products, setProducts] = useState([]);
  const [dbStaff, setDbStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shopDomain, setShopDomain] = useState('');
  const [isLiveConfigured, setIsLiveConfigured] = useState(false);

  // Modal State for adding service & variant to product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    serviceTitle: '',
    servicePrice: '',
    durationMinutes: 60,
    category: 'Hair & Styling',
    description: '',
    staffId: '',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shopify/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setDbStaff(data.allDbStaff || []);
        setShopDomain(data.shopDomain || '');
        setIsLiveConfigured(data.isLiveCredentialsConfigured || false);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      serviceTitle: '',
      servicePrice: product.minPrice || '85.00',
      durationMinutes: 60,
      category: 'Service Package',
      description: `Bookable service for ${product.title}`,
      staffId: dbStaff[0]?._id || '',
    });
    setErrorMessage('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/shopify/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopifyProductId: selectedProduct.id,
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Service & Shopify Variant successfully created!');
        fetchProducts();
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMessage('');
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Failed to create variant service.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-[5px] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            Shopify Storefront API Connected
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Shopify Products & Service Variants
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage product-specific bookable services and staff variants synced with Shopify Storefront API
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-[5px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-2 transition-all cursor-pointer"
            title="Refresh Products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync API</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {!isLiveConfigured && (
        <div className="p-4 rounded-[5px] bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Showing demo products view. To sync your <strong>3 new Shopify products</strong> live from your store, enter your real <code className="bg-amber-950/60 px-1.5 py-0.5 rounded font-mono text-amber-200">SHOPIFY_STORE_DOMAIN</code> and <code className="bg-amber-950/60 px-1.5 py-0.5 rounded font-mono text-amber-200">SHOPIFY_ADMIN_API_ACCESS_TOKEN</code> in <code className="bg-amber-950/60 px-1.5 py-0.5 rounded font-mono text-amber-200">BookingDotCom/.env.local</code>.
            </span>
          </div>
          <button
            onClick={fetchProducts}
            className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all cursor-pointer shrink-0"
          >
            Sync Live API
          </button>
        </div>
      )}

      {/* Search Bar & Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Shopify products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-9 pr-4 py-2 rounded-[5px] text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-cyan-400 font-bold">{filteredProducts.length}</span> Shopify products
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Fetching products via Storefront API...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-[5px] border border-slate-800 space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-slate-300 font-bold text-base">No Products Found</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            No products match your search query or are registered in Shopify Storefront API.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="glass-panel rounded-[5px] border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
            >
              <div>
                {/* Image & Price Header */}
                <div className="h-48 relative overflow-hidden bg-slate-900">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-emerald-400 text-xs font-bold font-mono">
                    From ${product.minPrice} {product.currency}
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-[5px] bg-slate-900/90 text-cyan-300 text-[10px] font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {product.variants?.length || 0} Shopify Variants
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-100 text-lg leading-snug">{product.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{product.description}</p>
                  </div>

                  {/* Product-Specific Services */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                        Assigned Services ({product.assignedServices?.length || 0})
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenAddModal(product)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Service & Variant
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {product.assignedServices?.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic p-2 bg-slate-900/40 rounded border border-slate-800/60">
                          No distinct services created for this product yet.
                        </div>
                      ) : (
                        product.assignedServices.map((srv) => (
                          <div
                            key={srv._id}
                            className="p-2.5 rounded-[5px] bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-slate-200">{srv.title}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{srv.durationMinutes} mins</span> • <span>{srv.category}</span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-emerald-400">${srv.price?.toFixed(2)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Assigned Staff */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      Product Specialist Staff ({product.assignedStaff?.length || 0})
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.assignedStaff?.map((st) => (
                        <div
                          key={st._id}
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-slate-900 border border-slate-800 text-xs text-slate-300"
                        >
                          <img
                            src={st.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'}
                            alt={st.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>{st.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">ID: {product.numericId}</span>
                <button
                  onClick={() => handleOpenAddModal(product)}
                  className="px-3 py-1.5 rounded-[5px] bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Variant to Product
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service & Variant Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-[5px] border border-slate-800 space-y-4 bg-[#0c111d]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-cyan-400" />
                  Add Service & Shopify Variant
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Product: {selectedProduct.title}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {successMessage}
              </div>
            )}

            <form onSubmit={handleAddServiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Service Variant Title *</label>
                <input
                  type="text"
                  name="serviceTitle"
                  required
                  value={formData.serviceTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. VIP Master Cut & Blowout"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="servicePrice"
                    required
                    value={formData.servicePrice}
                    onChange={handleInputChange}
                    placeholder="95.00"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Duration (Minutes)</label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Assign Specialist Staff</label>
                <select
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Any Staff Member</option>
                  {dbStaff.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Service Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Details of service package..."
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <span>{submitting ? 'Creating & Syncing...' : 'Create & Sync Variant'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
