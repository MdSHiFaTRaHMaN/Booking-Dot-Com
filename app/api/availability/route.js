import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Staff from '@/lib/models/Staff.js';
import Booking from '@/lib/models/Booking.js';
import Holiday from '@/lib/models/Holiday.js';

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('staffId');
    const date = searchParams.get('date'); // YYYY-MM-DD
    const durationMinutes = Number(searchParams.get('duration') || 60);

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date parameter is required.' }, { status: 400 });
    }

    const selectedDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[selectedDate.getDay()];

    // 1. Check if store/holiday exists for date
    const isHoliday = await Holiday.findOne({ date: date });
    if (isHoliday) {
      return NextResponse.json({ success: true, date, availableSlots: [], message: 'Store is closed on selected holiday date.' });
    }

    // 2. Fetch staff if provided, or default hours
    let staff = null;
    if (staffId && staffId !== 'any') {
      staff = await Staff.findById(staffId);
    }

    let shift = { startTime: '09:00', endTime: '17:00', isWorking: true };
    if (staff && staff.workingShifts) {
      const dayShift = staff.workingShifts.find((s) => s.day === dayOfWeek);
      if (dayShift) {
        shift = dayShift;
      }
    }

    if (!shift.isWorking) {
      return NextResponse.json({
        success: true,
        date,
        availableSlots: [],
        message: `${staff ? staff.name : 'Staff'} is off on ${dayOfWeek}s.`,
      });
    }

    // 3. Fetch existing bookings for this staff on this date
    const bookingQuery = { bookingDate: date, status: { $ne: 'CANCELLED' } };
    if (staff) bookingQuery.staffId = staff._id;
    const existingBookings = await Booking.find(bookingQuery);

    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const formatTime = (totalMins) => {
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      return `${hh}:${mm}`;
    };

    const startMins = parseTime(shift.startTime);
    const endMins = parseTime(shift.endTime);
    const step = 30; // 30-min intervals

    const availableSlots = [];

    for (let timeMins = startMins; timeMins + durationMinutes <= endMins; timeMins += step) {
      const slotStart = timeMins;
      const slotEnd = timeMins + durationMinutes;

      // Check conflict with existing bookings
      const isConflicting = existingBookings.some((b) => {
        const bStart = parseTime(b.startTime);
        const bEnd = parseTime(b.endTime);
        return Math.max(slotStart, bStart) < Math.min(slotEnd, bEnd);
      });

      if (!isConflicting) {
        availableSlots.push({
          time: formatTime(slotStart),
          formattedTime: `${formatTime(slotStart)} - ${formatTime(slotEnd)}`,
          available: true,
        });
      }
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    return NextResponse.json(
      {
        success: true,
        date,
        dayOfWeek,
        staffName: staff ? staff.name : 'Any Available Staff',
        availableSlots,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
