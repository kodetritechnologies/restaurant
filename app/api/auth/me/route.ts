import { NextResponse } from "next/server";
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

    return NextResponse.json(
      {
        success: true,
        admin: {
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error checking auth.", error: error.message },
      { status: 500 }
    );
  }
}
