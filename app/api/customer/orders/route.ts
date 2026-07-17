import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateToken, verifyToken } from "@/utils/lib/jwt";
import dbConnect from "@/utils/lib/dbConnect";
import Order from "@/utils/models/Order";
import Customer from "@/utils/models/Customer";
import Product from "@/utils/models/Product";
import ProductVariant from "@/utils/models/ProductVariant";
import { getPaginatedData } from "@/utils/lib/pagination";
import { processPayment } from "@/utils/lib/paymentHandlers";
export async function GET(req: Request) {
  try {
    const customerId = req.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    const { data: orders, totalCount, totalPages, currentPage } = await getPaginatedData(
      Order,
      { customerId: customerId },
      { page, limit: limit || "5" }
    );

    return NextResponse.json({ 
      success: true,
      count: orders.length,
      totalCount,
      totalPages,
      currentPage,
      orders,
    });
  } catch (error: any) {
    console.error("Get Orders Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

  export async function POST(req: Request) {
  try {
    let customerId = req.headers.get("x-customer-id") || null;
    let customerEmail = req.headers.get("x-customer-email") || null;

    const body = await req.json();
    const { cartItems, customerDetails, deliveryType, paymentMethod, deliveryFee } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    await dbConnect();

    if (!customerDetails || !customerDetails.phone) {
      return NextResponse.json({ success: false, message: "Phone number is required to place an order." }, { status: 400 });
    }

    if (deliveryType === "dinein") {
      const cookieStore = await cookies();
      const tableToken = cookieStore.get("tableToken")?.value;
      if (!tableToken) {
        return NextResponse.json({ success: false, message: "No active table session found" }, { status: 403 });
      }
      try {
        const decoded: any = verifyToken(tableToken);
        customerDetails.tableNumber = decoded.table;
      } catch (err) {
        return NextResponse.json({ success: false, message: "Invalid table session" }, { status: 403 });
      }
    }

    // --- SECURE PRICING CALCULATION ---
    let calculatedSubtotal = 0;
    const securedCartItems = [];

    for (const item of cartItems) {
      if (!item.productId) {
        return NextResponse.json({ success: false, message: "Invalid cart item" }, { status: 400 });
      }

      let price = 0;

      if (item.variantId) {
        const variant = await ProductVariant.findById(item.variantId);
        if (!variant) return NextResponse.json({ success: false, message: "Variant not found" }, { status: 400 });
        price = variant.salePrice > 0 ? variant.salePrice : variant.regularPrice;
      } else {
        const product = await Product.findById(item.productId);
        if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 400 });
        price = product.salePrice > 0 ? product.salePrice : product.regularPrice;
      }

      calculatedSubtotal += price * (item.quantity || 1);
      securedCartItems.push({
        ...item,
        price,
      });
    }

    const calculatedTotalAmount = calculatedSubtotal + (Number(deliveryFee) || 0);
    // ----------------------------------

    let customer = await Customer.findOne({ phone: customerDetails.phone });

    if (customer) {
      let updateData: any = {};
      if (customerDetails.name && customerDetails.name !== customer.name) updateData.name = customerDetails.name;
      if (customerDetails.email && customerDetails.email !== customer.email) updateData.email = customerDetails.email;
      if (customerDetails.address && customerDetails.address !== customer.address) updateData.address = customerDetails.address;
      if (customerDetails.city && customerDetails.city !== customer.city) updateData.city = customerDetails.city;

      if (Object.keys(updateData).length > 0) {
        if (updateData.email) {
          const existingEmail = await Customer.findOne({ email: updateData.email, _id: { $ne: customer._id } });
          if (existingEmail) {
            delete updateData.email;  
          }
        }
        customer = await Customer.findByIdAndUpdate(customer._id, updateData, { new: true });
      }
      customerId = customer._id;
    } else {
      if (customerDetails.email) {
        const existingEmail = await Customer.findOne({ email: customerDetails.email });
        if (existingEmail) {
           return NextResponse.json({ success: false, message: "This email is associated with a different phone number. Please use a different email or log in." }, { status: 400 });
        }
      }

      customer = await Customer.create({
        name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        address: customerDetails.address,
        city: customerDetails.city,
      });
      customerId = customer._id;
    }

    const paymentPayload = {
      cartItems: securedCartItems,
      customerDetails,
      deliveryType,
      paymentMethod,
      subtotal: calculatedSubtotal,
      deliveryFee,
      totalAmount: calculatedTotalAmount,
      ...body, 
    };

    const paymentResult = await processPayment(paymentMethod, paymentPayload);

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, message: paymentResult.message ?? "Payment failed." },
        { status: 402 }
      );
    }

    const newOrder = await Order.create({
      customerId,
      items: securedCartItems,
      deliveryType,
      paymentMethod,
      customerDetails,
      subtotal: calculatedSubtotal,
      deliveryFee,
      totalAmount: calculatedTotalAmount,
      ...(paymentResult.transactionId && { transactionId: paymentResult.transactionId }),
    });

    let token = null;
    const existingToken = req.headers.get("x-customer-id");
    if (!existingToken && customerId) {
      token = generateToken({ id: customerId, email: customer.email });
      const cookieStore = await cookies();
      cookieStore.set("customerToken", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return NextResponse.json({ success: true, message: "Order placed successfully", order: newOrder, token }, { status: 201 });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ success: false, message: "Failed to place order" }, { status: 500 });
  }
}
