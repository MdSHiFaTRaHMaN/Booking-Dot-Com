import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Staff from '@/lib/models/Staff.js';
import User from '@/lib/models/User.js';
import Service from '@/lib/models/Service.js';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectToDatabase();
    const staffMembers = await Staff.find({ status: 'ACTIVE' }).populate({ path: 'services', model: Service });
    return NextResponse.json({ success: true, staff: staffMembers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, password, title, phone, bio, avatar, commissionRate, workingShifts, services } = body;

    if (!email || !password || !name || !title) {
      return NextResponse.json(
        { success: false, error: 'Name, Email, Password, and Title are required.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user or staff member with this email already exists.' },
        { status: 400 }
      );
    }

    // Hash password and create User login credentials
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'STAFF',
      avatar: avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      phone,
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

    // Create Staff profile linked to User
    const staff = await Staff.create({
      userId: user._id,
      name,
      email: email.toLowerCase(),
      phone,
      title,
      bio,
      avatar: avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      services: services || [],
      workingShifts: workingShifts && workingShifts.length > 0 ? workingShifts : defaultShifts,
      commissionRate: commissionRate ? Number(commissionRate) : 15,
      status: 'ACTIVE',
    });

    return NextResponse.json({ success: true, staff }, { status: 201 });
  } catch (error) {
    console.error('Staff creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Staff ID is required.' }, { status: 400 });
    }

    const staff = await Staff.findById(id);
    if (staff) {
      if (staff.userId) {
        await User.findByIdAndDelete(staff.userId);
      }
      await Staff.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true, message: 'Staff member deleted.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
