import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Credential from "@/utils/models/Credential";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const credentials = await Credential.findOne({});
    
    if (!credentials) {
      return NextResponse.json(
        { success: true, paymentMethods: { cod: true, razorpay: false, payLater: false } },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        paymentMethods: { 
          cod: credentials.cod?.isActive ?? true, 
          razorpay: credentials.razorpay?.isActive ?? false,
          payLater: credentials.payLater?.isActive ?? false
        } 
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Server error getting payment methods." },
      { status: 500 }
    );
  }
}
