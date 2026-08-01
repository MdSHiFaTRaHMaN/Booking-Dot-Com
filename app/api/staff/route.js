import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Staff from '@/lib/models/Staff.js';
import Service from '@/lib/models/Service.js';

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
    const staff = await Staff.create(body);
    return NextResponse.json({ success: true, staff }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
