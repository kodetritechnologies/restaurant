import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Customer from "@/utils/models/Customer";
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
    
    // Parse filters
    const url = new URL(req.url);
    const search = url.searchParams.get("search");

    let query: any = { deleted_at: null };
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await Customer.find(query)
      .select("-otp -otpExpires") // Don't return sensitive OTP fields
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, count: customers.length, customers },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("List Customers Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error loading customers.", error: error.message },
      { status: 500 }
    );
  }
}
