import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Customer from "@/utils/models/Customer";
import Setting from "@/utils/models/Setting";
import { getRedisClient } from "@/utils/lib/redis";

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

    const setting = await Setting.findOne();
    
    const baseUrl = process.env.base_url;
    const appName = process.env.APP_NAME; 
    const logoUrl = setting?.restaurantLogo;
    
    const emailJobData = {
      to: email,
      subject: `Your Login OTP - ${appName}`,
      templateName: "otp",
      context: {
        name: customer.name || "Customer",
        otp,
        year: new Date().getFullYear(),
        appName,
        logoUrl,
      },
    };

    const redis = await getRedisClient();
    try {
      await Promise.race([
        redis.lPush("email_queue", JSON.stringify(emailJobData)),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Redis lPush Timeout")), 3000))
      ]);
    } catch (e) {
      console.error("Redis Push Error:", e);
    }

    try {
      await Promise.race([
        redis.disconnect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Redis disconnect Timeout")), 1000))
      ]);
    } catch (e) {}

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
