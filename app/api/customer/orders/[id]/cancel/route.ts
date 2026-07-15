import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Order from "@/utils/models/Order";
import Setting from "@/utils/models/Setting";

export async function PATCH(
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
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ success: false, message: "Only pending orders can be cancelled." }, { status: 400 });
    }

    const settings = await Setting.findOne({});
    const timeLimit = settings?.cancellationTimeLimit ?? 5;

    if (timeLimit === 0) {
      return NextResponse.json({ success: false, message: "Order cancellations are currently disabled." }, { status: 400 });
    }

    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = Date.now();
    const elapsedMinutes = (currentTime - orderTime) / (1000 * 60);

    if (elapsedMinutes > timeLimit) {
      return NextResponse.json({ 
        success: false, 
        message: `The cancellation time period of ${timeLimit} minutes has expired.` 
      }, { status: 400 });
    }

    order.status = "cancelled";
    await order.save();

    return NextResponse.json({ 
      success: true,
      message: "Order cancelled successfully",
      order: order
    });
  } catch (error: any) {
    console.error("Cancel Order Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
