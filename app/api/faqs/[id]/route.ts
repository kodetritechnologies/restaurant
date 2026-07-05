import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Faq from "@/utils/models/Faq";
import { verifyAdmin } from "@/utils/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();
    
    const deletedFaq = await Faq.findByIdAndDelete(id);

    if (!deletedFaq) {
      return NextResponse.json(
        { success: false, message: "FAQ not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "FAQ deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE FAQ Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete FAQ.", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();
    const updatedFaq = await Faq.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!updatedFaq) {
      return NextResponse.json(
        { success: false, message: "FAQ not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "FAQ updated successfully.", faq: updatedFaq },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT FAQ Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update FAQ.", error: error.message },
      { status: 500 }
    );
  }
}
