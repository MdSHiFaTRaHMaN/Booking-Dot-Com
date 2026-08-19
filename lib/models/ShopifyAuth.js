import mongoose from 'mongoose';

const ShopifyAuthSchema = new mongoose.Schema(
  {
    shopDomain: { type: String, required: true, unique: true, index: true },
    accessToken: { type: String, required: true },
    expiresIn: { type: Number, default: 86400 }, // 24 hours in seconds
    expiresAt: { type: Date, required: true, index: true },
    lastRefreshedAt: { type: Date, default: Date.now },
    scope: { type: String },
    tokenType: { type: String, default: 'Bearer' },
  },
  { timestamps: true }
);

const ShopifyAuth = mongoose.models.ShopifyAuth || mongoose.model('ShopifyAuth', ShopifyAuthSchema);

export default ShopifyAuth;
