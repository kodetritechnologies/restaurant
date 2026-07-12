import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Reservation from "@/utils/models/Reservation";
import Message from "@/utils/models/Message";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await dbConnect();

    const totalBookingsCount = await Reservation.countDocuments({});
    const pendingBookingsCount = await Reservation.countDocuments({ status: "Pending" });
    const totalMessagesCount = await Message.countDocuments({ status: "Unread" });

    const revenueAggregation = await Reservation.aggregate([
      { $match: { status: { $in: ["Confirmed", "Completed"] } } },
      { $group: { _id: null, totalGuests: { $sum: "$guests" } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalGuests * 50 : 0;

    const pendingBookings = await Reservation.find({ status: "Pending" }).sort({ createdAt: -1 }).limit(5);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartItems = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      
      const dateStr = d.toISOString().split('T')[0];
      
      const count = await Reservation.countDocuments({
        date: dateStr
      });
      
      chartItems.push({
        day: dayName,
        count: count,
        height: count > 0 ? `${Math.min(100, count * 25)}%` : "4%"
      });
    }

    const popularHours = [
      { name: "18:00 - 19:30 (Dinner Intro)", count: await Reservation.countDocuments({ time: { $regex: "^18:|^19:0" } }), percentage: 0 },
      { name: "19:30 - 21:00 (Dinner Peak)", count: await Reservation.countDocuments({ time: { $regex: "^19:3|^20:" } }), percentage: 0 },
      { name: "21:00 - 23:00 (Late Dinner)", count: await Reservation.countDocuments({ time: { $regex: "^21:|^22:" } }), percentage: 0 },
      { name: "12:00 - 15:00 (Lunch Slots)", count: await Reservation.countDocuments({ time: { $regex: "^12:|^13:|^14:|^15:" } }), percentage: 0 }
    ];

    const maxHoursCount = Math.max(...popularHours.map(h => h.count), 1);
    popularHours.forEach(h => {
      h.percentage = Math.round((h.count / maxHoursCount) * 100);
    });

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalBookingsCount,
          totalRevenue,
          pendingBookingsCount,
          totalMessagesCount,
          chartItems,
          popularHours,
          pendingBookings
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error calculating stats.", error: error.message },
      { status: 500 }
    );
  }
}
