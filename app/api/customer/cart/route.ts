import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import dbConnect from "@/utils/lib/dbConnect";
import Cart from "@/utils/models/Cart";
import "@/utils/models/Product";
import "@/utils/models/ProductVariant";
import { verifyToken } from "@/utils/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customerToken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    await dbConnect();
    const cart = await Cart.findOne({ customerId: decoded.id })
      .populate("items.productId", "name featuredImage productType quantity salePrice regularPrice")
      .populate("items.variantId", "variantName quantity salePrice regularPrice galleryImages");

    return NextResponse.json({ success: true, cart: cart || { items: [] } }, { status: 200 });
  } catch (error: any) {
    console.error("Get Cart Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customerToken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, message: "Items must be an array" }, { status: 400 });
    }

    await dbConnect();

    const formattedItems = items.map(item => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      variantId: item.variantId ? new mongoose.Types.ObjectId(item.variantId) : null,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1
    }));

    const subtotalAmount = formattedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const cart = await Cart.findOneAndUpdate(
      { customerId: decoded.id },
      { 
        $set: { 
          items: formattedItems,
          customerId: new mongoose.Types.ObjectId(decoded.id),
          subtotalAmount: subtotalAmount,
          totalAmount: subtotalAmount
        } 
      },
      { new: true, upsert: true }
    )
    .populate("items.productId", "name featuredImage productType quantity salePrice regularPrice")
    .populate("items.variantId", "variantName quantity salePrice regularPrice galleryImages");

    return NextResponse.json({ success: true, cart }, { status: 200 });
  } catch (error: any) {
    console.error("Post Cart Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
