import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import { verifyShopifyWebhook } from '@/lib/shopify.js';
import Booking from '@/lib/models/Booking.js';
import Tip from '@/lib/models/Tip.js';
import Service from '@/lib/models/Service.js';
import Staff from '@/lib/models/Staff.js';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const topic = req.headers.get('x-shopify-topic');

    const isValid = verifyShopifyWebhook(rawBody, hmacHeader);
    if (!isValid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    await connectToDatabase();

    console.log(`[Shopify Webhook] Topic: ${topic}`, payload.id);

    switch (topic) {
      case 'orders/create':
      case 'orders/paid': {
        const orderId = String(payload.id);
        const orderNumber = payload.name || `#${payload.order_number}`;
        const customerEmail = payload.email || payload.customer?.email || 'customer@example.com';
        const customerName = payload.customer
          ? `${payload.customer.first_name} ${payload.customer.last_name}`.trim()
          : payload.billing_address?.name || 'Shopify Customer';
        const customerPhone = payload.phone || payload.customer?.phone;

        if (payload.note_attributes || payload.custom_attributes) {
          const attributes = payload.note_attributes || payload.custom_attributes || [];
          const typeAttr = attributes.find((a) => a.name === 'type' || a.key === 'type');
          const bookingIdAttr = attributes.find((a) => a.name === 'booking_id' || a.key === 'booking_id');

          if (typeAttr?.value === 'STAFF_TIP' && bookingIdAttr?.value) {
            const tip = await Tip.findOne({ bookingId: bookingIdAttr.value });
            if (tip) {
              tip.status = 'PAID';
              tip.paidAt = new Date();
              await tip.save();
              console.log(`[Tip Checkout Paid] Updated tip status to PAID for booking ${bookingIdAttr.value}`);
            }
            return NextResponse.json({ success: true, message: 'Tip checkout processed' });
          }
        }

        const lineItems = payload.line_items || [];
        for (const item of lineItems) {
          const shopifyProductId = String(item.product_id);
          let service = await Service.findOne({ shopifyProductId });
          if (!service) {
            service = await Service.findOne({ title: { $regex: item.title, $options: 'i' } });
            if (!service) {
              service = await Service.create({
                shopifyProductId,
                title: item.title,
                price: parseFloat(item.price),
                durationMinutes: 60,
              });
            }
          }

          let staffId = service.assignedStaff?.[0];
          if (!staffId) {
            const fallbackStaff = await Staff.findOne({ status: 'ACTIVE' });
            staffId = fallbackStaff?._id;
          }

          if (staffId && service) {
            const dateStr = new Date().toISOString().split('T')[0];
            const existing = await Booking.findOne({ shopifyOrderId: orderId });

            if (!existing) {
              await Booking.create({
                shopifyOrderId: orderId,
                shopifyOrderNumber: orderNumber,
                customerName,
                customerEmail,
                customerPhone,
                serviceId: service._id,
                staffId,
                date: dateStr,
                startTime: '11:00',
                endTime: '12:00',
                status: 'CONFIRMED',
                paymentStatus: 'PAID',
                price: parseFloat(item.price),
              });
              console.log(`[Booking Created] New booking created from Shopify Order ${orderNumber}`);
            } else {
              existing.paymentStatus = 'PAID';
              await existing.save();
            }
          }
        }
        break;
      }

      case 'orders/cancelled': {
        const orderId = String(payload.id);
        const booking = await Booking.findOne({ shopifyOrderId: orderId });
        if (booking) {
          booking.status = 'CANCELLED';
          booking.paymentStatus = 'REFUNDED';
          await booking.save();
        }
        break;
      }

      case 'products/update': {
        const shopifyProductId = String(payload.id);
        const service = await Service.findOne({ shopifyProductId });
        if (service) {
          service.title = payload.title || service.title;
          if (payload.variants?.[0]?.price) {
            service.price = parseFloat(payload.variants[0].price);
          }
          await service.save();
        }
        break;
      }

      default:
        console.log(`[Shopify Webhook] Unhandled topic: ${topic}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Shopify Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
