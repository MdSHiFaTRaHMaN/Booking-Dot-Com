import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Settings from '@/lib/models/Settings.js';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({
        storeName: 'Luxe Aesthetics Salon & Spa',
        contactEmail: 'admin@bookingdotcom.com',
        currency: 'USD',
        minLeadTimeHours: 2,
        maxAdvanceDays: 60,
        autoApproveBookings: true,
      });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    let settings = await Settings.findOne({});
    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, body, { new: true });
    } else {
      settings = await Settings.create(body);
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
