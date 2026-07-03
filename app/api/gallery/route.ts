import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Gallery from "@/utils/models/Gallery";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const items = await Gallery.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: items.length, items }, { status: 200 });
  } catch (error: any) {
    console.error("GET Gallery Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch gallery items.", error: error.message },
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
    const { url, publicId, title, category } = await req.json();

    if (!url || !publicId) {
      return NextResponse.json(
        { success: false, message: "Missing image url or publicId." },
        { status: 400 }
      );
    }

    const newItem = await Gallery.create({
      url,
      publicId,
      title: title || "",
      category: category || "Interior",
    });

    return NextResponse.json(
      { success: true, message: "Gallery item saved successfully.", item: newItem },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Gallery Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save gallery item.", error: error.message },
      { status: 500 }
    );
  }
}
