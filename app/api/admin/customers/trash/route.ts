import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Customer from "@/utils/models/Customer";
import { verifyAdmin } from "@/utils/lib/auth";

// GET /api/admin/customers/trash — list soft-deleted customers
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

    let query: any = { deleted_at: { $ne: null } };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await Customer.find(query)
      .select("-otp -otpExpires")
      .sort({ deleted_at: -1 });

    return NextResponse.json(
      { success: true, count: customers.length, customers },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Trash Customers Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error.", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/customers/trash — restore a customer { id }
export async function PATCH(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required." },
        { status: 400 }
      );
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      { deleted_at: null },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Customer restored successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Restore Customer Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error.", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/customers/trash — permanently delete a customer ?id=...
export async function DELETE(req: Request) {
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
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required." },
        { status: 400 }
      );
    }

    const customer = await Customer.findOneAndDelete({
      _id: id,
      deleted_at: { $ne: null },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found in trash." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Customer permanently deleted." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Permanent Delete Customer Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error.", error: error.message },
      { status: 500 }
    );
  }
}
