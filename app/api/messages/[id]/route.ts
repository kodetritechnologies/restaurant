import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Message from "@/utils/models/Message";
import { verifyAdmin } from "@/utils/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return NextResponse.json(
        { success: false, message: "Message not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message updated successfully.", messageData: updatedMessage },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Message Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error updating message.", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    await dbConnect();
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return NextResponse.json(
        { success: false, message: "Message not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Message Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error deleting message.", error: error.message },
      { status: 500 }
    );
  }
}
