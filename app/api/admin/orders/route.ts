import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Order from "@/utils/models/Order";
import { verifyAdmin } from "@/utils/lib/auth";
import { getPaginatedData } from "@/utils/lib/pagination";

export async function GET(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");
    const trash = searchParams.get("trash");

    const query: any = {};

    if (trash === "true") {
      query.deletedAt = { $ne: null };
    } else {
      query.deletedAt = null;
    }

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { "customerDetails.name": { $regex: search, $options: "i" } },
        { "customerDetails.phone": { $regex: search, $options: "i" } },
        { "customerDetails.email": { $regex: search, $options: "i" } },
      ];
    }

    const { data: orders, totalCount, totalPages, currentPage } = await getPaginatedData(
      Order,
      query,
      { page, limit: limit || "10" }
    );

    return NextResponse.json({
      success: true,
      count: orders.length,
      totalCount,
      totalPages,
      currentPage,
      orders,
    });
  } catch (error: any) {
    console.error("Admin GET Orders Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
