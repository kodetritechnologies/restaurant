import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Product from "@/utils/models/Product";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let query: any = { deletedAt: { $ne: null } };
    
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    await dbConnect();
    
    const products = await Product.find(query)
      .populate('variants')
      .sort({ deletedAt: -1 });
    
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: any) {
    console.error("GET Deleted Products Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch deleted products.", error: error.message },
      { status: 500 }
    );
  }
}
