import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/lib/dbConnect";
import Cart from "@/utils/models/Cart";
import "@/utils/models/Product";
import "@/utils/models/ProductVariant";

export async function GET(req: Request) {
  try {
    const customerId = req.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const cart = await Cart.findOne({ customerId: customerId })
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
    const customerId = req.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
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
      { customerId: customerId },
      { 
        $set: { 
          items: formattedItems,
          customerId: new mongoose.Types.ObjectId(customerId),
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
