import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Credential from "@/utils/models/Credential";
import Currency from "@/utils/models/Currency";
import Product from "@/utils/models/Product";
import ProductVariant from "@/utils/models/ProductVariant";
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

    const body = await req.json();
    const { cartItems, deliveryFee } = body;
    
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty." },
        { status: 400 }
      );
    }

    let calculatedSubtotal = 0;

    for (const item of cartItems) {
      if (!item.productId) continue;
      let price = 0;
      if (item.variantId) {
        const variant = await ProductVariant.findById(item.variantId);
        if (variant) {
          price = variant.salePrice > 0 ? variant.salePrice : variant.regularPrice;
        }
      } else {
        const product = await Product.findById(item.productId);
        if (product) {
          price = product.salePrice > 0 ? product.salePrice : product.regularPrice;
        }
      }
      calculatedSubtotal += price * (item.quantity || 1);
    }

    const calculatedTotalAmount = calculatedSubtotal + (Number(deliveryFee) || 0);

    if (calculatedTotalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount calculated." },
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
      amount: Math.round(calculatedTotalAmount * 100),
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
      { success: false, message: "Failed to create Razorpay order." },
      { status: 500 }
    );
  }
}
