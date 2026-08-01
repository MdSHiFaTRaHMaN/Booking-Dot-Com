import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Booking from '@/lib/models/Booking.js';
import Staff from '@/lib/models/Staff.js';
import Tip from '@/lib/models/Tip.js';
import { createShopifyTipCheckout } from '@/lib/shopify.js';

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { bookingId, amount } = body;

    if (!bookingId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid bookingId and tip amount are required' }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId).populate({ path: 'staffId', model: Staff });
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const staffName = booking.staffId?.name || 'Service Staff';

    const { draftOrderId, invoiceUrl } = await createShopifyTipCheckout({
      amount: parseFloat(amount),
      staffName,
      customerEmail: booking.customerEmail,
      bookingId: String(booking._id),
    });

    let tip = await Tip.findOne({ bookingId: booking._id });
    if (tip) {
      tip.amount = parseFloat(amount);
      tip.shopifyDraftOrderId = draftOrderId;
      tip.shopifyCheckoutUrl = invoiceUrl;
      tip.status = 'PENDING';
      await tip.save();
    } else {
      tip = await Tip.create({
        bookingId: booking._id,
        staffId: booking.staffId._id || booking.staffId,
        amount: parseFloat(amount),
        currency: booking.currency || 'USD',
        shopifyDraftOrderId: draftOrderId,
        shopifyCheckoutUrl: invoiceUrl,
        status: 'PENDING',
      });
    }

    booking.tipId = tip._id;
    await booking.save();

    return NextResponse.json({
      success: true,
      checkoutUrl: invoiceUrl,
      tipId: tip._id,
      draftOrderId,
    });
  } catch (error) {
    console.error('Error creating tip checkout:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
