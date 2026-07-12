import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/utils/lib/dbConnect";
import Admin from "@/utils/models/Admin";
import { verifyAdmin } from "@/utils/lib/auth";

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Please provide old and new passwords." },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const adminWithPassword = await Admin.findById(admin._id);
    if (!adminWithPassword) {
      return NextResponse.json(
        { success: false, message: "Admin not found." },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(oldPassword, adminWithPassword.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect current password." },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    adminWithPassword.password = hashedPassword;
    await adminWithPassword.save();

    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error changing password.", error: error.message },
      { status: 500 }
    );
  }
}
