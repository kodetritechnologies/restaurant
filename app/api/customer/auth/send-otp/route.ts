import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Customer from "@/utils/models/Customer";
import Setting from "@/utils/models/Setting";
import { getRedisClient } from "@/utils/lib/redis";

export async function POST(req: Request) {
  try {
    console.time("1. req.json");
    const { email } = await req.json();
    console.timeEnd("1. req.json");

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

    console.time("2. dbConnect");
    await dbConnect();
    console.timeEnd("2. dbConnect");

    console.time("3. Customer.findOne");
    let customer = await Customer.findOne({ email, deleted_at: null });
    console.timeEnd("3. Customer.findOne");

    if (customer) {
      customer.otp = otp;
      customer.otpExpires = otpExpires;
      console.time("4a. customer.save");
      await customer.save();
      console.timeEnd("4a. customer.save");
    } else {
      console.time("4b. check deletedCustomer");
      const deletedCustomer = await Customer.findOne({ email, deleted_at: { $ne: null } });
      console.timeEnd("4b. check deletedCustomer");
      
      if (deletedCustomer) {
        return NextResponse.json(
          { success: false, message: "Account has been deleted" },
          { status: 403 }
        );
      }

      console.time("4c. Customer.create");
      customer = await Customer.create({
        email,
        otp,
        otpExpires,
      });
      console.timeEnd("4c. Customer.create");
    }

    console.time("5. Setting.findOne");
    const setting = await Setting.findOne();
    console.timeEnd("5. Setting.findOne");
    
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

    console.time("6. getRedisClient");
    console.log("Redis Env Check:", { 
      host: process.env.REDIS_HOST, 
      hasPassword: !!process.env.REDIS_PASSWORD 
    });
    const redis = await getRedisClient();
    console.timeEnd("6. getRedisClient");

    console.time("7. redis.lPush");
    try {
      // Add a 3-second timeout to prevent the API from hanging indefinitely
      await Promise.race([
        redis.lPush("email_queue", JSON.stringify(emailJobData)),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Redis lPush Timeout")), 3000))
      ]);
      console.timeEnd("7. redis.lPush");
    } catch (e) {
      console.error("Redis Push Error:", e);
    }

    console.time("8. redis.disconnect");
    try {
      await Promise.race([
        redis.disconnect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Redis disconnect Timeout")), 1000))
      ]);
    } catch (e) {}
    console.timeEnd("8. redis.disconnect");

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
