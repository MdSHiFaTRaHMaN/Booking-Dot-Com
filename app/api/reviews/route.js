import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Review from '@/lib/models/Review.js';
import Booking from '@/lib/models/Booking.js';

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('staffId');
    const query = staffId ? { staffId, status: 'APPROVED' } : { status: 'APPROVED' };

    const reviews = await Review.find(query)
      .populate('staffId', 'name avatar title')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { bookingId, rating, comment, photos } = body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const review = await Review.create({
      bookingId: booking._id,
      staffId: booking.staffId,
      serviceId: booking.serviceId,
      customerName: booking.customerName,
      rating,
      comment,
      photos: photos || [],
      status: 'APPROVED',
    });

    booking.reviewId = review._id;
    await booking.save();

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
