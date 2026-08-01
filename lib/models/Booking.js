import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    shopifyOrderId: { type: String },
    shopifyOrderNumber: { type: String },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'REFUNDED'],
      default: 'PAID',
    },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    notes: { type: String },
    tipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tip' },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export default Booking;
