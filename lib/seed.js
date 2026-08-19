import connectToDatabase from './db.js';
import User from './models/User.js';
import Staff from './models/Staff.js';
import Service from './models/Service.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';
import Tip from './models/Tip.js';
import Settings from './models/Settings.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  await connectToDatabase();

  // Clear all collections
  await User.deleteMany({});
  await Staff.deleteMany({});
  await Service.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Tip.deleteMany({});
  await Settings.deleteMany({});

  console.log('Clearing old data and initializing clean system...');

  // 1. Create Default Admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await User.create({
    name: 'System Admin',
    email: 'admin@bookingdotcom.com',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+1 (555) 019-2834',
  });

  // 2. Create Staff Users & Profiles
  const staffPasswordHash = await bcrypt.hash('staff123', 10);
  
  const staffUser1 = await User.create({
    name: 'Elena Rostova',
    email: 'elena@bookingdotcom.com',
    passwordHash: staffPasswordHash,
    role: 'STAFF',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    phone: '+1 (555) 234-5678',
  });

  const staffUser2 = await User.create({
    name: 'Sophia Thorne',
    email: 'sophia@bookingdotcom.com',
    passwordHash: staffPasswordHash,
    role: 'STAFF',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+1 (555) 876-5432',
  });

  const workingShifts = [
    { day: 'Monday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', isWorking: true, startTime: '10:00', endTime: '16:00' },
    { day: 'Sunday', isWorking: false, startTime: '09:00', endTime: '17:00' },
  ];

  const staffDoc1 = await Staff.create({
    userId: staffUser1._id,
    name: 'Elena Rostova',
    email: 'elena@bookingdotcom.com',
    phone: '+1 (555) 234-5678',
    title: 'Lead Aesthetician & Skincare Specialist',
    bio: 'Specialist in cellular skin rejuvenation and anti-aging therapies with 8+ years experience.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    commissionRate: 15,
    status: 'ACTIVE',
    workingShifts,
  });

  const staffDoc2 = await Staff.create({
    userId: staffUser2._id,
    name: 'Sophia Thorne',
    email: 'sophia@bookingdotcom.com',
    phone: '+1 (555) 876-5432',
    title: 'Certified Laser & Detox Expert',
    bio: 'Expert in SkinTox purifying procedures and precision facial contouring treatments.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    commissionRate: 12,
    status: 'ACTIVE',
    workingShifts,
  });

  // 3. Create Default Services linked to Staff
  const service1 = await Service.create({
    title: 'Cell Regenerator Therapy',
    description: 'Advanced cellular skin regeneration treatment boosting collagen and skin repair.',
    durationMinutes: 60,
    bufferMinutes: 15,
    price: 120,
    category: 'Skincare',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500',
    assignedStaff: [staffDoc1._id, staffDoc2._id],
    status: 'ACTIVE',
  });

  const service2 = await Service.create({
    title: 'SkinTox Deep Purification',
    description: 'Deep detoxifying skin procedure eliminating impurities and restoring natural radiance.',
    durationMinutes: 45,
    bufferMinutes: 15,
    price: 95,
    category: 'Detox',
    imageUrl: 'https://images.unsplash.com/photo-1512290900673-7002fffe947a?w=500',
    assignedStaff: [staffDoc2._id],
    status: 'ACTIVE',
  });

  const service3 = await Service.create({
    title: 'Resurfacing Neck & Chest',
    description: 'Targeted skin resurfacing therapy for neck and chest contouring and smoothing.',
    durationMinutes: 75,
    bufferMinutes: 15,
    price: 140,
    category: 'Body Care',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
    assignedStaff: [staffDoc1._id],
    status: 'ACTIVE',
  });

  const service4 = await Service.create({
    title: 'Signature Laser Facial',
    description: 'Precision laser facial rejuvenation addressing fine lines, tone, and skin texture.',
    durationMinutes: 60,
    bufferMinutes: 15,
    price: 185,
    category: 'Laser',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
    assignedStaff: [staffDoc1._id, staffDoc2._id],
    status: 'ACTIVE',
  });

  // Link services to staff
  staffDoc1.services = [service1._id, service3._id, service4._id];
  await staffDoc1.save();

  staffDoc2.services = [service1._id, service2._id, service4._id];
  await staffDoc2.save();

  // 4. Create Default Settings
  await Settings.create({
    storeName: 'Luxe Aesthetics Salon & Spa',
    contactEmail: 'admin@bookingdotcom.com',
    currency: 'USD',
    minLeadTimeHours: 2,
    maxAdvanceDays: 60,
    autoApproveBookings: true,
  });

  console.log('Database initialized successfully with Admin, Staff, and Services!');
}

export async function clearAllData() {
  await seedDatabase();
}
