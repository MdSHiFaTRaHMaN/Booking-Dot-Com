import connectToDatabase from './db.js';
import User from './models/User.js';
import Staff from './models/Staff.js';
import Service from './models/Service.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';
import Tip from './models/Tip.js';
import Settings from './models/Settings.js';

export async function seedDatabase() {
  await connectToDatabase();

  await User.deleteMany({});
  await Staff.deleteMany({});
  await Service.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Tip.deleteMany({});
  await Settings.deleteMany({});

  console.log('Seeding initial data...');

  const adminUser = await User.create({
    name: 'Sarah Jenkins (Admin)',
    email: 'admin@bookingdotcom.com',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+1 (555) 019-2834',
  });

  const staffUser1 = await User.create({
    name: 'Elena Rostova',
    email: 'elena@bookingdotcom.com',
    role: 'STAFF',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    phone: '+1 (555) 012-3456',
  });

  const staffUser2 = await User.create({
    name: 'Marcus Vance',
    email: 'marcus@bookingdotcom.com',
    role: 'STAFF',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+1 (555) 014-9876',
  });

  const service1 = await Service.create({
    shopifyProductId: 'gid://shopify/Product/8920192',
    shopifyVariantId: 'gid://shopify/ProductVariant/44910291',
    title: 'Signature Haircut & Styling',
    description: 'Custom wash, precision haircut, scalp massage, and professional blowout.',
    durationMinutes: 60,
    bufferMinutes: 15,
    price: 85.0,
    category: 'Hair Care',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500',
  });

  const service2 = await Service.create({
    shopifyProductId: 'gid://shopify/Product/8920193',
    shopifyVariantId: 'gid://shopify/ProductVariant/44910292',
    title: 'Balayage & Color Gloss',
    description: 'Hand-painted highlights followed by custom glossing treatment for vibrant color.',
    durationMinutes: 120,
    bufferMinutes: 30,
    price: 210.0,
    category: 'Hair Color',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
  });

  const service3 = await Service.create({
    shopifyProductId: 'gid://shopify/Product/8920194',
    shopifyVariantId: 'gid://shopify/ProductVariant/44910293',
    title: 'Deep Tissue Massage & Aromatherapy',
    description: 'Targeted muscle relief using essential oils and hot stone accent massage.',
    durationMinutes: 75,
    bufferMinutes: 15,
    price: 130.0,
    category: 'Spa & Wellness',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',
  });

  const defaultShifts = [
    { day: 'Monday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', isWorking: true, startTime: '10:00', endTime: '15:00' },
    { day: 'Sunday', isWorking: false, startTime: '09:00', endTime: '17:00' },
  ];

  const staff1 = await Staff.create({
    userId: staffUser1._id,
    name: 'Elena Rostova',
    email: 'elena@bookingdotcom.com',
    phone: '+1 (555) 012-3456',
    title: 'Master Hair Stylist & Color Specialist',
    bio: '10+ years experience in European styling and balayage technique.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    services: [service1._id, service2._id],
    workingShifts: defaultShifts,
    commissionRate: 20,
    status: 'ACTIVE',
  });

  const staff2 = await Staff.create({
    userId: staffUser2._id,
    name: 'Marcus Vance',
    email: 'marcus@bookingdotcom.com',
    phone: '+1 (555) 014-9876',
    title: 'Senior Massage Therapist',
    bio: 'Certified deep tissue therapist specializing in sports rehabilitation and relaxation.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    services: [service3._id],
    workingShifts: defaultShifts,
    commissionRate: 15,
    status: 'ACTIVE',
  });

  await Service.findByIdAndUpdate(service1._id, { assignedStaff: [staff1._id] });
  await Service.findByIdAndUpdate(service2._id, { assignedStaff: [staff1._id] });
  await Service.findByIdAndUpdate(service3._id, { assignedStaff: [staff2._id] });

  const today = new Date().toISOString().split('T')[0];

  const booking1 = await Booking.create({
    shopifyOrderId: 'order_1001',
    shopifyOrderNumber: '#SHOPIFY-1001',
    customerName: 'Sophia Loren',
    customerEmail: 'sophia@example.com',
    customerPhone: '+1 (555) 432-1098',
    serviceId: service1._id,
    staffId: staff1._id,
    date: today,
    startTime: '10:00',
    endTime: '11:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    price: 85.0,
    notes: 'Customer requested soft blowout finish.',
    completedAt: new Date(),
  });

  const booking2 = await Booking.create({
    shopifyOrderId: 'order_1002',
    shopifyOrderNumber: '#SHOPIFY-1002',
    customerName: 'Alexander Wright',
    customerEmail: 'alex@example.com',
    customerPhone: '+1 (555) 987-6543',
    serviceId: service3._id,
    staffId: staff2._id,
    date: today,
    startTime: '13:00',
    endTime: '14:15',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    price: 130.0,
    notes: 'Focus on lower back tension.',
  });

  const booking3 = await Booking.create({
    shopifyOrderId: 'order_1003',
    shopifyOrderNumber: '#SHOPIFY-1003',
    customerName: 'Chloe Bennett',
    customerEmail: 'chloe@example.com',
    customerPhone: '+1 (555) 678-1234',
    serviceId: service2._id,
    staffId: staff1._id,
    date: today,
    startTime: '15:00',
    endTime: '17:00',
    status: 'IN_PROGRESS',
    paymentStatus: 'PAID',
    price: 210.0,
  });

  const tip1 = await Tip.create({
    bookingId: booking1._id,
    staffId: staff1._id,
    amount: 15.0,
    shopifyDraftOrderId: 'draft_90218',
    shopifyCheckoutUrl: 'https://demo-salon-booking.myshopify.com/checkout?mock_draft_order=draft_90218',
    status: 'PAID',
    paidAt: new Date(),
  });

  const review1 = await Review.create({
    bookingId: booking1._id,
    staffId: staff1._id,
    serviceId: service1._id,
    customerName: 'Sophia Loren',
    rating: 5,
    comment: 'Elena is absolute magic! Best haircut and blowout I have had in years. Will definitely return!',
    photos: ['https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400'],
    status: 'APPROVED',
  });

  await Booking.findByIdAndUpdate(booking1._id, {
    tipId: tip1._id,
    reviewId: review1._id,
  });

  await Settings.create({
    storeName: 'Luxe Aesthetics Salon & Spa',
    contactEmail: 'concierge@luxesalon.com',
    currency: 'USD',
    minLeadTimeHours: 2,
    maxAdvanceDays: 60,
    autoApproveBookings: true,
  });

  console.log('Database seeded successfully!');
}
