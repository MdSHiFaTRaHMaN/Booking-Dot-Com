import mongoose from 'mongoose';

const WorkingShiftSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  isWorking: { type: Boolean, default: true },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
});

const StaffSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    title: { type: String, required: true },
    bio: { type: String },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    workingShifts: [WorkingShiftSchema],
    commissionRate: { type: Number, default: 10 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

const Staff = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);

export default Staff;
