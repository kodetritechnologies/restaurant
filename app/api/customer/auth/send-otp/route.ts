import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Customer from "@/utils/models/Customer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await dbConnect();

    // Check if customer exists
    let customer = await Customer.findOne({ email });

    if (customer) {
      // Update existing customer OTP
      customer.otp = otp;
      customer.otpExpires = otpExpires;
      await customer.save();
    } else {
      // Create new customer
      customer = await Customer.create({
        email,
        otp,
        otpExpires,
      });
    }

    // MOCK EMAIL SENDING
    console.log(`\n\n[MOCK EMAIL] OTP for ${email} is: ${otp}\n\n`);

    return NextResponse.json(
      { 
        success: true, 
        message: "OTP sent successfully",
        // Only return OTP in dev mode, but for this mock we'll include it for easier testing
        devOtp: otp 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error sending OTP", error: error.message },
      { status: 500 }
    );
  }
}
