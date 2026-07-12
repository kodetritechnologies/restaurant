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

    const otp = process.env.NODE_ENV === "development" 
      ? "123456" 
      : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);  

    await dbConnect();

    let customer = await Customer.findOne({ email, deleted_at: null });

    if (customer) {
      customer.otp = otp;
      customer.otpExpires = otpExpires;
      await customer.save();
    } else {
      const deletedCustomer = await Customer.findOne({ email, deleted_at: { $ne: null } });
      
      if (deletedCustomer) {
        return NextResponse.json(
          { success: false, message: "Account has been deleted" },
          { status: 403 }
        );
      }

      customer = await Customer.create({
        email,
        otp,
        otpExpires,
      });
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "OTP sent successfully",
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
