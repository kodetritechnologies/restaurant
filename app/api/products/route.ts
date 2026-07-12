import { NextResponse } from "next/server";
import { getPaginatedData } from "@/utils/lib/pagination";
import dbConnect from "@/utils/lib/dbConnect";
import Product from "@/utils/models/Product";
import ProductVariant from "@/utils/models/ProductVariant";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const productType = searchParams.get("productType");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    let query: any = { deletedAt: null };
    
    if (featured === "true") query.featured = true;
    const signature = searchParams.get("signature");
    if (signature === "true") query.signature = true;
    if (productType) query.productType = productType;
    if (status) query.status = status;
    if (category && category !== "all") query.categories = category;
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    await dbConnect();
    
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    const { data: products, totalCount, totalPages, currentPage } = await getPaginatedData(
      Product,
      query,
      { page, limit, populate: "variants" },
      { createdAt: -1 }
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
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      shortDescription,
      description,
      featuredImage,
      galleryImages,
      regularPrice,
      salePrice,
      quantity,
      featured,
      signature,
      categories,
      productType,
      variants, 
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }

    if (productType === "simple") {
      if (regularPrice === undefined) {
        return NextResponse.json(
          { success: false, message: "Regular price is required for simple products." },
          { status: 400 }
        );
      }
      if (salePrice !== undefined && Number(salePrice) > Number(regularPrice)) {
          return NextResponse.json(
            { success: false, message: "Sale price cannot be greater than regular price." },
            { status: 400 }
          );
      }
    }
    
    if (productType === "variable" && (!variants || variants.length === 0)) {
        return NextResponse.json(
          { success: false, message: "Variable products must contain at least one variant." },
          { status: 400 }
        );
    }

    await dbConnect();

    const newProduct = await Product.create({
      name,
      shortDescription,
      description,
      featuredImage,
      galleryImages: galleryImages || [],
      regularPrice,
      salePrice,
      quantity,
      featured,
      signature,
      categories: categories || [],
      productType,
    });

    let createdVariantIds: any[] = [];
    
    if (productType === "simple") {
      const simpleVariant = await ProductVariant.create({
        productId: newProduct._id,
        variantName: "Default",
        sku: "",
        regularPrice,
        salePrice,
        quantity,
      });
      createdVariantIds.push(simpleVariant._id);
    } else if (productType === "variable" && variants && variants.length > 0) {
      const variantDocs = variants.map((v: any) => ({
        productId: newProduct._id,
        variantName: v.variantName,
        sku: v.sku,
        regularPrice: v.regularPrice,
        salePrice: v.salePrice,
        quantity: v.quantity,
        galleryImages: v.galleryImages || [],
      }));
      
      const insertedVariants = await ProductVariant.insertMany(variantDocs);
      createdVariantIds = insertedVariants.map(v => v._id);
    }

    newProduct.variants = createdVariantIds;
    await newProduct.save();

    return NextResponse.json(
      { success: true, message: "Product created successfully.", product: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Product Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product.", error: error.message },
      { status: 500 }
    );
  }
}
