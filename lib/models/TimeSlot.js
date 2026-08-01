import mongoose from 'mongoose';

const TimeSlotSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  },
  { timestamps: true }
);

TimeSlotSchema.index({ staffId: 1, date: 1, startTime: 1 });

const TimeSlot = mongoose.models.TimeSlot || mongoose.model('TimeSlot', TimeSlotSchema);

export default TimeSlot;
