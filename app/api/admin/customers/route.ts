import { NextResponse } from "next/server";
import { getPaginatedData } from "@/utils/lib/pagination";
import dbConnect from "@/utils/lib/dbConnect";
import Customer from "@/utils/models/Customer";
import { verifyAdmin } from "@/utils/lib/auth";

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
    const search = url.searchParams.get("search");

    let query: any = { deleted_at: null };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
      query.$or.push({
        $expr: {
          $regexMatch: {
            input: { $toString: "$phone" },
            regex: search,
            options: "i"
          }
        }
      });
    }

    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");

    const { data: customers, totalCount, totalPages, currentPage } = await getPaginatedData(
      Customer,
      query,
      { page, limit, select: "-otp -otpExpires" }
    );

    return NextResponse.json(
      {
        success: true,
        count: customers.length,
        totalCount,
        totalPages,
        currentPage,
        customers
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("List Customers Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error loading customers.", error: error.message },
      { status: 500 }
    );
  }
}
