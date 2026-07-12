import { NextResponse } from "next/server";
import { getPaginatedData } from "@/utils/lib/pagination";
import dbConnect from "@/utils/lib/dbConnect";
import Currency from "@/utils/models/Currency";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isDefault = searchParams.get("default") === "true";
    
    if (isDefault) {
      const currency = await Currency.findOne({ isDefault: true });
      return NextResponse.json({ success: true, currency }, { status: 200 });
    }
    
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    const { data: currencies, totalCount, totalPages, currentPage } = await getPaginatedData(
      Currency,
      {},
      { page, limit }
    );

    return NextResponse.json({ 
      success: true, 
      count: currencies.length,
      totalCount,
      totalPages,
      currentPage,
      currencies 
    }, { status: 200 });
  } catch (error: any) {
    console.error("GET Currency Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch currencies.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, code, symbol, isDefault } = body;

    if (!name || !code || !symbol) {
      return NextResponse.json(
        { success: false, message: "Name, Code, and Symbol are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    const count = await Currency.countDocuments();
    let willBeDefault = isDefault;
    if (count === 0) {
      willBeDefault = true;
    }

    const newCurrency = await Currency.create({
      name,
      code,
      symbol,
      isDefault: willBeDefault
    });

    return NextResponse.json(
      { success: true, message: "Currency created successfully.", currency: newCurrency },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Currency Error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Currency code already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create currency.", error: error.message },
      { status: 500 }
    );
  }
}
