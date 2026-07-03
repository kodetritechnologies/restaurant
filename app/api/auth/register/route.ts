import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/utils/lib/dbConnect";
import Admin from "@/utils/models/Admin";
import { generateToken } from "@/utils/lib/jwt";
import { verifyAdmin } from "@/utils/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Require authentication if at least one admin already exists (bootstrapping restriction)
    const adminCount = await Admin.countDocuments({});
    if (adminCount > 0) {
      const requester = await verifyAdmin(req);
      if (!requester) {
        return NextResponse.json(
          { success: false, message: "Unauthorized. Admin registration is restricted." },
          { status: 401 }
        );
      }
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide name, email, and password." },
        { status: 400 }
      );
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: "Email already registered to an admin account." },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken({ id: newAdmin._id, email: newAdmin.email });

    return NextResponse.json(
      {
        success: true,
        message: "Admin registered successfully.",
        token,
        admin: {
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error during registration.", error: error.message },
      { status: 500 }
    );
  }
}
