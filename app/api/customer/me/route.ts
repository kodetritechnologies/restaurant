import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Customer from "@/utils/models/Customer";
export async function GET(req: Request) {
  try {
    const customerId = req.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const customer = await Customer.findById(customerId).select("-otp -otpExpires");

    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Get Customer Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
