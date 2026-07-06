import { NextResponse } from "next/server";
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
    
    const products = await Product.find(query)
      .populate('variants')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, products }, { status: 200 });
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
      status,
      variants, // Array of variant objects if variable product
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }

    if (productType === "simple") {
      if (regularPrice === undefined || !featuredImage) {
        return NextResponse.json(
          { success: false, message: "Regular price and featured image are required for simple products." },
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

    // Create the product first
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
      status,
    });

    // Create variants and store their IDs on the product
    let createdVariantIds: any[] = [];
    
    if (productType === "simple") {
      // Auto-create a single variant for the simple product
      const simpleVariant = await ProductVariant.create({
        productId: newProduct._id,
        variantName: "Default",
        sku: "",
        regularPrice,
        salePrice,
        quantity,
        status: status || "active",
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
        status: v.status || "active",
      }));
      
      const insertedVariants = await ProductVariant.insertMany(variantDocs);
      createdVariantIds = insertedVariants.map(v => v._id);
    }

    // Attach variant IDs to product
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
