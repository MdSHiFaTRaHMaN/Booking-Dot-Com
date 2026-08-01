import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    photos: [{ type: String }],
    status: { type: String, enum: ['APPROVED', 'PENDING', 'HIDDEN'], default: 'APPROVED' },
  },
  { timestamps: true }
);

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

export default Review;
