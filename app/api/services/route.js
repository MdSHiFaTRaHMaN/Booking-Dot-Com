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
    const service = await Service.create(body);
    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
