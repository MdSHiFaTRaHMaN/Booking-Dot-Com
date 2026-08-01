import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    shopifyProductId: { type: String },
    shopifyVariantId: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    durationMinutes: { type: Number, required: true, default: 60 },
    bufferMinutes: { type: Number, default: 15 },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    category: { type: String, default: 'General' },
    imageUrl: { type: String },
    assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

export default Service;
