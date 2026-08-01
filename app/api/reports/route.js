import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Booking from '@/lib/models/Booking.js';
import Tip from '@/lib/models/Tip.js';
import Staff from '@/lib/models/Staff.js';

export async function GET() {
  try {
    await connectToDatabase();

    const bookings = await Booking.find({});
    const tips = await Tip.find({});
    const staffMembers = await Staff.find({});

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const totalTips = tips.reduce((sum, t) => sum + (t.amount || 0), 0);

    const staffBreakdown = staffMembers.map((staff) => {
      const staffBookings = bookings.filter(
        (b) => b.staffId && b.staffId.toString() === staff._id.toString()
      );
      const completedCount = staffBookings.filter((b) => b.status === 'COMPLETED').length;
      const serviceRevenue = staffBookings.reduce((sum, b) => sum + (b.price || 0), 0);
      
      const staffTips = tips.filter(
        (t) => t.staffId && t.staffId.toString() === staff._id.toString()
      );
      const tipsEarned = staffTips.reduce((sum, t) => sum + (t.amount || 0), 0);

      const commission = (serviceRevenue * (staff.commissionRate || 15)) / 100;
      const totalPayout = commission + tipsEarned;

      return {
        _id: staff._id,
        name: staff.name,
        completedServices: completedCount,
        serviceRevenue,
        commissionRate: staff.commissionRate || 15,
        tipsEarned,
        totalPayout,
      };
    });

    const totalStaffPayouts = staffBreakdown.reduce((sum, s) => sum + s.totalPayout, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalTips,
        totalStaffPayouts,
        staffBreakdown,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
