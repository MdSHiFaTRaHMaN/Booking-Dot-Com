import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Shopify Booking Salon & Spa' },
    contactEmail: { type: String, default: 'support@bookingdotcom.com' },
    currency: { type: String, default: 'USD' },
    minLeadTimeHours: { type: Number, default: 2 },
    maxAdvanceDays: { type: Number, default: 60 },
    autoApproveBookings: { type: Boolean, default: true },
    webhookSecret: { type: String },
    cloudinaryCloudName: { type: String },
  },
  { timestamps: true }
);

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

export default Settings;
