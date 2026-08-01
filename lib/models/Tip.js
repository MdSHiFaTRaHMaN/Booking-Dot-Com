import mongoose from 'mongoose';

const TipSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    shopifyDraftOrderId: { type: String },
    shopifyCheckoutUrl: { type: String },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

const Tip = mongoose.models.Tip || mongoose.model('Tip', TipSchema);

export default Tip;
