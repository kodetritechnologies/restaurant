import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Review from "@/utils/models/Review";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, reviews }, { status: 200 });
  } catch (error: any) {
    console.error("GET Reviews Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews.", error: error.message },
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

    const body = await req.json();
    await dbConnect();
    
    const newReview = await Review.create(body);

    return NextResponse.json(
      { success: true, message: "Review added successfully.", review: newReview },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Review Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add review.", error: error.message },
      { status: 500 }
    );
  }
}
