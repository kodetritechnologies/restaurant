import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/utils/lib/dbConnect";
import Customer from "@/utils/models/Customer";
import { generateToken } from "@/utils/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find customer by email
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found. Please request a new OTP." },
        { status: 404 }
      );
    }

    // Verify OTP and expiration
    if (customer.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (customer.otpExpires && new Date() > customer.otpExpires) {
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark as verified and clear OTP
    customer.isVerified = true;
    customer.otp = null;
    customer.otpExpires = null;
    await customer.save();

    // Generate JWT token
    const token = generateToken({ id: customer._id, email: customer.email });

    // Set cookie on server side
    const cookieStore = await cookies();
    cookieStore.set("customerToken", token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // false allows client-side reading for basic state management if needed
    });

    return NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully.",
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error verifying OTP", error: error.message },
      { status: 500 }
    );
  }
}
