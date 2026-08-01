import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Service from '@/lib/models/Service.js';
import Staff from '@/lib/models/Staff.js';

export async function GET() {
  try {
    await connectToDatabase();
    const services = await Service.find({ status: 'ACTIVE' }).populate({ path: 'assignedStaff', model: Staff });
    return NextResponse.json({ success: true, services });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { title, description, durationMinutes, bufferMinutes, price, category, imageUrl } = body;

    if (!title || !price || !durationMinutes) {
      return NextResponse.json(
        { success: false, error: 'Title, Price, and Duration are required.' },
        { status: 400 }
      );
    }

    const service = await Service.create({
      title,
      description: description || '',
      durationMinutes: Number(durationMinutes),
      bufferMinutes: Number(bufferMinutes || 15),
      price: Number(price),
      category: category || 'General',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500',
      shopifyProductId: `gid://shopify/Product/${Math.floor(1000000 + Math.random() * 9000000)}`,
      shopifyVariantId: `gid://shopify/ProductVariant/${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'ACTIVE',
    });

    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Service ID is required.' }, { status: 400 });
    }

    await Service.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
