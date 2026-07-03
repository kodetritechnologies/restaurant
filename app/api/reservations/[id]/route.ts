import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Reservation from "@/utils/models/Reservation";
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
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedReservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Reservation updated successfully.", reservation: updatedReservation },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Reservation Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error updating reservation.", error: error.message },
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
    const deletedReservation = await Reservation.findByIdAndDelete(id);

    if (!deletedReservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Reservation deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Reservation Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error deleting reservation.", error: error.message },
      { status: 500 }
    );
  }
}
