import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Order from "@/utils/models/Order";
import { verifyAdmin } from "@/utils/lib/auth";
import "@/utils/models/Product";
import "@/utils/models/ProductVariant";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const order = await Order.findById(id)
      .populate("customerId", "name email phone")
      .populate("items.productId", "name featuredImage regularPrice salePrice")
      .populate("items.variantId", "variantName galleryImages regularPrice salePrice");

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Admin GET Order Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { action, status, paymentStatus } = body;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (action === "trash") {
      order.deletedAt = new Date();
      await order.save();
      return NextResponse.json({ success: true, message: "Order moved to trash" });
    }

    if (action === "restore") {
      order.deletedAt = null;
      await order.save();
      return NextResponse.json({ success: true, message: "Order restored successfully" });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    return NextResponse.json({ success: true, message: "Order updated successfully", order });
  } catch (error: any) {
    console.error("Admin PATCH Order Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force");

    if (force === "true") {
      await Order.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: "Order permanently deleted" });
    }

    const order = await Order.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order moved to trash" });
  } catch (error: any) {
    console.error("Admin DELETE Order Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
