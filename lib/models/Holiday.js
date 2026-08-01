import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

const Holiday = mongoose.models.Holiday || mongoose.model('Holiday', HolidaySchema);

export default Holiday;
