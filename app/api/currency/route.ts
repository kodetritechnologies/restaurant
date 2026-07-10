import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Currency from "@/utils/models/Currency";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isDefault = searchParams.get("default") === "true";
    
    let currencies;
    if (isDefault) {
      currencies = await Currency.find({ isDefault: true }).sort({ createdAt: -1 });
    } else {
      currencies = await Currency.find().sort({ createdAt: -1 });
    }
    
    return NextResponse.json({ success: true, currencies }, { status: 200 });
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

    // Check if it's the first currency ever added
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
