import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Currency from "@/utils/models/Currency";
import { verifyAdmin } from "@/utils/lib/auth";

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

    const currency = await Currency.findById(id);
    if (!currency) {
      return NextResponse.json(
        { success: false, message: "Currency not found." },
        { status: 404 }
      );
    }

    if (body.name) currency.name = body.name;
    if (body.code) currency.code = body.code;
    if (body.symbol) currency.symbol = body.symbol;
    if (body.isDefault !== undefined) currency.isDefault = body.isDefault;

    await currency.save();

    return NextResponse.json(
      { success: true, message: "Currency updated successfully.", currency },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT Currency Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update currency.", error: error.message },
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
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const currency = await Currency.findById(id);
    if (!currency) {
      return NextResponse.json(
        { success: false, message: "Currency not found." },
        { status: 404 }
      );
    }

    if (currency.isDefault) {
      return NextResponse.json(
        { success: false, message: "Cannot delete the default currency. Please set another currency as default first." },
        { status: 400 }
      );
    }

    await Currency.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Currency deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE Currency Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete currency.", error: error.message },
      { status: 500 }
    );
  }
}
