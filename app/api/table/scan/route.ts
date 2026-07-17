import { NextResponse } from "next/server";
import { generateToken } from "@/utils/lib/jwt";

export async function POST(req: Request) {
  try {
    const { tableNumber } = await req.json();

    if (!tableNumber) {
      return NextResponse.json({ success: false, message: "Table number is required" }, { status: 400 });
    }

    // Generate a secure token containing the table number
    // We can use the existing generateToken which signs the payload with JWT_SECRET
    const token = generateToken({ table: tableNumber });

    return NextResponse.json({ 
      success: true, 
      token,
      message: "Table scanned successfully" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Table Scan Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
