import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/utils/lib/dbConnect";
import Order from "@/utils/models/Order";
import Customer from "@/utils/models/Customer";
import { verifyToken } from "@/utils/lib/jwt";
import { getPaginatedData } from "@/utils/lib/pagination";
import { processPayment } from "@/utils/lib/paymentHandlers";
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
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    const { data: orders, totalCount, totalPages, currentPage } = await getPaginatedData(
      Order,
      { customerId: decoded.id },
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
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

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


    const body = await req.json();
    const { cartItems, customerDetails, deliveryType, paymentMethod, subtotal, deliveryFee, totalAmount } = body;


    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    await dbConnect();

    if (!customerDetails || !customerDetails.phone) {
      return NextResponse.json({ success: false, message: "Phone number is required to place an order." }, { status: 400 });
    }

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
      cartItems,
      customerDetails,
      deliveryType,
      paymentMethod,
      subtotal,
      deliveryFee,
      totalAmount,
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
      items: cartItems,
      deliveryType,
      paymentMethod,
      customerDetails,
      subtotal,
      deliveryFee,
      totalAmount,
      ...(paymentResult.transactionId && { transactionId: paymentResult.transactionId }),
    });

    return NextResponse.json({ success: true, message: "Order placed successfully", order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ success: false, message: "Failed to place order", error: error.message }, { status: 500 });
  }
}
