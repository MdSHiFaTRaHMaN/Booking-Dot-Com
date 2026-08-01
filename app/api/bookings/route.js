import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Booking from '@/lib/models/Booking.js';
import Service from '@/lib/models/Service.js';
import Staff from '@/lib/models/Staff.js';
import Review from '@/lib/models/Review.js';
import Tip from '@/lib/models/Tip.js';

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');
    const status = searchParams.get('status');

    const query = {};
    if (date) query.date = date;
    if (staffId) query.staffId = staffId;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate({ path: 'serviceId', model: Service })
      .populate({ path: 'staffId', model: Staff })
      .populate({ path: 'reviewId', model: Review })
      .populate({ path: 'tipId', model: Tip })
      .sort({ date: 1, startTime: 1 });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const booking = await Booking.create(body);
    const populated = await Booking.findById(booking._id)
      .populate({ path: 'serviceId', model: Service })
      .populate({ path: 'staffId', model: Staff });

    return NextResponse.json({ success: true, booking: populated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, status, notes, completedAt } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID is required' }, { status: 400 });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED' && !completedAt) {
        updateData.completedAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    const updated = await Booking.findByIdAndUpdate(id, updateData, { new: true })
      .populate({ path: 'serviceId', model: Service })
      .populate({ path: 'staffId', model: Staff });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
