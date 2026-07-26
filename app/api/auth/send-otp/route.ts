import { NextResponse } from "next/server";
import Admin from "@/utils/models/Admin";
import dbConnect from "@/utils/lib/dbConnect";
import { sendMail } from "@/utils/sendMail";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Please provide an email." },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({ email, deleted_at: null });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found." },
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const Setting = (await import("@/utils/models/Setting")).default;
    const setting = await Setting.findOne();
    
    const baseUrl = process.env.base_url || "http://localhost:3000";
    const appName = process.env.APP_NAME; 
    const logoUrl = setting?.restaurantLogo;

    const { redisClient } = await import("@/utils/lib/redis");
    
    const emailJobData = {
      to: email,
      subject: `Your Login OTP - ${appName}`,
      templateName: "otp",
      context: {
        name: admin.name,
        otp,
        year: new Date().getFullYear(),
        appName,
        logoUrl,
      },
    };

    await redisClient.lPush("email_queue", JSON.stringify(emailJobData));

    return NextResponse.json(
      { success: true, message: "OTP sent successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error.", error: error.message },
      { status: 500 }
    );
  }
}
