import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed.js';

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Database successfully seeded with demo data!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
