import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Chef from "@/utils/models/Chef";
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
    const deletedChef = await Chef.findByIdAndDelete(id);

    if (!deletedChef) {
      return NextResponse.json(
        { success: false, message: "Chef profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Chef profile deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE Chef Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete chef profile.", error: error.message },
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
    const updatedChef = await Chef.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!updatedChef) {
      return NextResponse.json(
        { success: false, message: "Chef profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Chef profile updated successfully.", chef: updatedChef },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT Chef Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update chef profile.", error: error.message },
      { status: 500 }
    );
  }
}
