import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Order from "@/utils/models/Order";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = req.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findOne({
      _id: id,
      customerId: customerId,
    }).populate("items.productId", "name featuredImage");

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const formattedOrder = order.toObject();
    formattedOrder.items = formattedOrder.items.map((item: any) => ({
      ...item,
      name: item.name || (item.productId ? item.productId.name : "Unknown Product"),
      image: item.image || (item.productId ? item.productId.featuredImage : null),
      productId: item.productId ? item.productId._id : item.productId,
    }));

    return NextResponse.json({ 
      success: true,
      order: formattedOrder,
    });
  } catch (error: any) {
    console.error("Get Order Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = req.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findOneAndDelete({
      _id: id,
      customerId: customerId,
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error: any) {
    console.error("Delete Order Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
