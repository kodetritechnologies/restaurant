import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Credential from "@/utils/models/Credential";
import Currency from "@/utils/models/Currency";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    await dbConnect();

    const credentials = await Credential.findOne({});

    if (!credentials?.razorpay?.isActive || !credentials?.razorpay?.key || !credentials?.razorpay?.secret) {
      return NextResponse.json(
        { success: false, message: "Razorpay is not configured or is disabled." },
        { status: 503 }
      );
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: credentials.razorpay.key.trim(),
      key_secret: credentials.razorpay.secret.trim(),
    });

    const defaultCurrency = await Currency.findOne({ isDefault: true });
    const currencyCode = defaultCurrency?.code || "INR";

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currencyCode,
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: credentials.razorpay.key,
    });
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create Razorpay order.", error: error.message },
      { status: 500 }
    );
  }
}
