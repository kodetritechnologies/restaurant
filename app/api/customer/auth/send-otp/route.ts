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

    const { sendMail } = await import("@/utils/sendMail");
    const Setting = (await import("@/utils/models/Setting")).default;
    
    const setting = await Setting.findOne();
    
    const baseUrl = process.env.base_url;
    const appName = process.env.APP_NAME; 
    const logoUrl = setting?.restaurantLogo;

    const { redisClient } = await import("@/utils/lib/redis");
    
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

    await redisClient.lPush("email_queue", JSON.stringify(emailJobData));

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
