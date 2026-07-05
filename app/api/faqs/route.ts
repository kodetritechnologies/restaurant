import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Faq from "@/utils/models/Faq";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const faqs = await Faq.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, faqs }, { status: 200 });
  } catch (error: any) {
    console.error("GET FAQs Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch FAQs.", error: error.message },
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
    
    // Assign order based on count if not provided
    if (body.order === undefined) {
      const count = await Faq.countDocuments();
      body.order = count;
    }

    const newFaq = await Faq.create(body);

    return NextResponse.json(
      { success: true, message: "FAQ added successfully.", faq: newFaq },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST FAQ Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add FAQ.", error: error.message },
      { status: 500 }
    );
  }
}
