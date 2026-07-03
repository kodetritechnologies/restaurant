import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Chef from "@/utils/models/Chef";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const chefs = await Chef.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: chefs.length, chefs }, { status: 200 });
  } catch (error: any) {
    console.error("GET Chefs Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chefs profiles.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    await dbConnect();
    const { name, role, image, publicId, facebook, instagram, twitter } = await req.json();

    if (!name || !role || !image || !publicId) {
      return NextResponse.json(
        { success: false, message: "Please fill in name, role, and profile photo." },
        { status: 400 }
      );
    }

    const newChef = await Chef.create({
      name,
      role,
      image,
      publicId,
      facebook: facebook || "",
      instagram: instagram || "",
      twitter: twitter || "",
    });

    return NextResponse.json(
      { success: true, message: "Chef profile created successfully.", chef: newChef },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Chef Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create chef profile.", error: error.message },
      { status: 500 }
    );
  }
}
