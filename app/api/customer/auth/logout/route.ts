import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("customerToken");

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error during logout", error: error.message },
      { status: 500 }
    );
  }
}
