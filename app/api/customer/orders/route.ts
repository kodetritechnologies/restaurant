import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/utils/lib/dbConnect";
import Order from "@/utils/models/Order";
import Customer from "@/utils/models/Customer";
import { verifyToken } from "@/utils/lib/jwt";

// Get customer orders
export async function GET(req: Request) {
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
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const skip = (page - 1) * limit;

    // Fetch orders sorted by newest first
    const orders = await Order.find({ customerId: decoded.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ customerId: decoded.id });
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({ 
      success: true, 
      orders,
      pagination: {
        page,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      }
    });
  } catch (error: any) {
    console.error("Get Orders Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

// Create a new order
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customerToken")?.value;

    let customerId = null;
    let customerEmail = null;

    if (token) {
      try {
        const decoded: any = verifyToken(token);
        if (decoded && decoded.id) {
          customerId = decoded.id;
          customerEmail = decoded.email;
        }
      } catch (err) {}
    }

    const { cartItems, customerDetails, deliveryType, paymentMethod, subtotal, deliveryFee, totalAmount } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    await dbConnect();

    // If not logged in, but email provided, try to find customer by email or create a placeholder logic
    // For simplicity, if not logged in, we reject, or we allow guest checkout without linking?
    // Since the instruction is for a customer dashboard, let's require authentication for this route, or allow guests by using a null customerId (but the schema requires it). Let's require customerId.
    if (!customerId) {
      // In a real app, you might want to create a guest account here.
      // But we will return an error because it's a customer-focused feature now.
      return NextResponse.json({ success: false, message: "Please log in to place an order." }, { status: 401 });
    }

    const newOrder = await Order.create({
      customerId,
      items: cartItems,
      deliveryType,
      paymentMethod,
      customerDetails,
      subtotal,
      deliveryFee,
      totalAmount,
    });

    return NextResponse.json({ success: true, message: "Order placed successfully", order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ success: false, message: "Failed to place order", error: error.message }, { status: 500 });
  }
}
