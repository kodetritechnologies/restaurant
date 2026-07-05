import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Review from "@/utils/models/Review";
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
    
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found." },
        { status: 404 }
      );
    }

    await Review.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Review deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE Review Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete review.", error: error.message },
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
    const updatedReview = await Review.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!updatedReview) {
      return NextResponse.json(
        { success: false, message: "Review not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Review updated successfully.", review: updatedReview },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT Review Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update review.", error: error.message },
      { status: 500 }
    );
  }
}
