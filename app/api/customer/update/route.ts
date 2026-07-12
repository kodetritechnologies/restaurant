import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Customer from "@/utils/models/Customer";
export async function PUT(req: Request) {
  try {
    const customerId = req.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { name, phone, address, city } = await req.json();

    await dbConnect();
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    customer.name = name ?? customer.name;
    customer.phone = phone ?? customer.phone;
    customer.address = address ?? customer.address;
    customer.city = city ?? customer.city;

    await customer.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
      }
    });
  } catch (error: any) {
    console.error("Update Customer Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
