import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Product from "@/utils/models/Product";
import Category from "@/utils/models/Category";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: true, products: [], categories: [] }, { status: 200 });
    }

    const regex = new RegExp(query.trim(), "i");

    await dbConnect();

    // Query Products
    const productsPromise = Product.find({
      name: { $regex: regex },
      status: "active",
      deletedAt: null
    })
      .select("_id name featuredImage regularPrice salePrice shortDescription")
      .limit(10)
      .lean();

    // Query Categories
    const categoriesPromise = Category.find({
      name: { $regex: regex }
    })
      .select("_id name image description slug")
      .limit(10)
      .lean();

    const [products, categories] = await Promise.all([productsPromise, categoriesPromise]);

    return NextResponse.json({ success: true, products, categories }, { status: 200 });
  } catch (error: any) {
    console.error("Global Search API Error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed.", error: error.message },
      { status: 500 }
    );
  }
}
