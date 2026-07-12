import { NextResponse } from "next/server";
import { getPaginatedData } from "@/utils/lib/pagination";
import dbConnect from "@/utils/lib/dbConnect";
import Reservation from "@/utils/models/Reservation";
import { verifyAdmin } from "@/utils/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, phone, email, guests, date, time, request } = await req.json();

    if (!name || !phone || !email || !guests || !date || !time) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const newReservation = await Reservation.create({
      name,
      phone,
      email,
      guests: Number(guests),
      date,
      time,
      request: request || "",
    });

    return NextResponse.json(
      { success: true, message: "Reservation created successfully.", reservation: newReservation },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Reservation Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error creating reservation.", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await dbConnect();

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");

    let query: any = {};
    if (status && status !== "All") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const { data: reservations, totalCount, totalPages, currentPage } = await getPaginatedData(
      Reservation,
      query,
      { page, limit }
    );

    return NextResponse.json(
      {
        success: true,
        count: reservations.length,
        totalCount,
        totalPages,
        currentPage,
        reservations
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("List Reservations Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error loading reservations.", error: error.message },
      { status: 500 }
    );
  }
}

