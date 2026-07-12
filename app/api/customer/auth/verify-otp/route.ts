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

    const customer = await Customer.findOne({ email, deleted_at: null });

    if (!customer) {
      const deletedCustomer = await Customer.findOne({ email, deleted_at: { $ne: null } });
      if (deletedCustomer) {
        return NextResponse.json(
          { success: false, message: "Account has been deleted" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Customer not found. Please request a new OTP." },
        { status: 404 }
      );
    }

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

    customer.isVerified = true;
    customer.otp = null;
    customer.otpExpires = null;
    await customer.save();
    const token = generateToken({ id: customer._id, email: customer.email });

    const cookieStore = await cookies();
    cookieStore.set("customerToken", token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Logged in successfully.",
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
