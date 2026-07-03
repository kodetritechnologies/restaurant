import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Gallery from "@/utils/models/Gallery";
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
    const deletedItem = await Gallery.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json(
        { success: false, message: "Gallery item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Gallery image deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE Gallery Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete gallery item.", error: error.message },
      { status: 500 }
    );
  }
}
