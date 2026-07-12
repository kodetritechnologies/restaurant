import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Credential from "@/utils/models/Credential";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    await dbConnect();
    let credentials = await Credential.findOne({});
    if (!credentials) {
      credentials = await Credential.create({
        razorpay: { key: "", secret: "", isActive: false },
        cod: { isActive: true },
        payLater: { isActive: false },
      });
    }

    return NextResponse.json(
      { success: true, credentials },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get Credentials Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error getting credentials.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();

    await dbConnect();
    let credentials = await Credential.findOne({});
    if (!credentials) {
      credentials = await Credential.create(body);
    } else {
      if (body.razorpay) credentials.razorpay = body.razorpay;
      if (body.cod) credentials.cod = body.cod;
      if (body.payLater) credentials.payLater = body.payLater;
      await credentials.save();
    }

    return NextResponse.json(
      { success: true, message: "Credentials updated successfully.", credentials },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Credentials Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error updating credentials.", error: error.message },
      { status: 500 }
    );
  }
}
