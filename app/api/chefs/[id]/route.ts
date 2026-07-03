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
