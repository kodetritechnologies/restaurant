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

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real production application, you should save the OTP and its expiry
    // to the database (e.g., in the Admin model) to verify it later.
    // admin.otp = otp;
    // admin.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    // await admin.save();

    // Send the email using the generic sendMail utility and hbs template
    const Setting = (await import("@/utils/models/Setting")).default;
    const setting = await Setting.findOne();
    
    const baseUrl = process.env.base_url || "http://localhost:3000";
    const appName = process.env.APP_NAME; 
    const logoUrl = setting?.restaurantLogo;

    // Fire and forget email sending so it doesn't block the API response
    sendMail({
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
    }).catch((error: any) => {
      console.error("Failed to send email via sendMail in background:", error);
    });

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
