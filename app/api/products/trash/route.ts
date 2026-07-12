import { NextResponse } from "next/server";
import { getPaginatedData } from "@/utils/lib/pagination";
import dbConnect from "@/utils/lib/dbConnect";
import Product from "@/utils/models/Product";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const productType = searchParams.get("productType");

    let query: any = { deletedAt: { $ne: null } };
    
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (productType) {
      query.productType = productType;
    }

    await dbConnect();
    
    const { data: products, totalCount, totalPages, currentPage } = await getPaginatedData(
      Product,
      query,
      { page, limit, populate: "variants" },
      { deletedAt: -1 }
    );
    
    return NextResponse.json({ 
      success: true, 
      count: products.length,
      totalCount,
      totalPages,
      currentPage,
      products 
    }, { status: 200 });
  } catch (error: any) {
    console.error("GET Deleted Products Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch deleted products.", error: error.message },
      { status: 500 }
    );
  }
}
