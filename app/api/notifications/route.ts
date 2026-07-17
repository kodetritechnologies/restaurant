import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/utils/lib/dbConnect";
import Notification from "@/utils/models/Notification";
import { verifyAdmin } from "@/utils/lib/auth";
import { verifyToken } from "@/utils/lib/jwt";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Verify admin access
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, notifications }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Notifications Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { message, isWaiterCall } = await req.json();

    if (!message) {
      return NextResponse.json({ success: false, message: "Message is required" }, { status: 400 });
    }

    let finalMessage = message;

    if (isWaiterCall) {
      const cookieStore = await cookies();
      const tableToken = cookieStore.get("tableToken")?.value;
      
      if (!tableToken) {
         return NextResponse.json({ success: false, message: "No active table session found" }, { status: 403 });
      }

      try {
        const decoded: any = verifyToken(tableToken);
        finalMessage = `Table ${decoded.table}: ${message}`;
      } catch (err) {
        return NextResponse.json({ success: false, message: "Invalid table session" }, { status: 403 });
      }
    }

    const notification = await Notification.create({ message: finalMessage });
    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error: any) {
    console.error("Create Notification Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    
    // Verify admin access
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Mark all as read
    await Notification.updateMany({ isRead: false }, { isRead: true });
    
    return NextResponse.json({ success: true, message: "Notifications marked as read" }, { status: 200 });
  } catch (error: any) {
    console.error("Update Notifications Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
