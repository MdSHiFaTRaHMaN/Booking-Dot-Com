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

  // Clear all demo data
  await User.deleteMany({});
  await Staff.deleteMany({});
  await Service.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Tip.deleteMany({});
  await Settings.deleteMany({});

  console.log('Clearing demo data and initializing clean system...');

  // Create default Admin account
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await User.create({
    name: 'System Admin',
    email: 'admin@bookingdotcom.com',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+1 (555) 019-2834',
  });

  // Create default Settings
  await Settings.create({
    storeName: 'Luxe Aesthetics Salon & Spa',
    contactEmail: 'admin@bookingdotcom.com',
    currency: 'USD',
    minLeadTimeHours: 2,
    maxAdvanceDays: 60,
    autoApproveBookings: true,
  });

  console.log('Database initialized successfully with default Admin!');
}

export async function clearAllData() {
  await seedDatabase();
}
