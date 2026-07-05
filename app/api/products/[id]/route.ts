import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Product from "@/utils/models/Product";
import ProductVariant from "@/utils/models/ProductVariant";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    let variants = [];
    if (product.productType === "variable") {
      variants = await ProductVariant.find({ productId: id });
    }

    return NextResponse.json(
      { success: true, product, variants },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET Product by ID Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product.", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = await params;
    
    if (body.productType === "simple") {
      if (body.salePrice !== undefined && Number(body.salePrice) > Number(body.regularPrice)) {
          return NextResponse.json(
            { success: false, message: "Sale price cannot be greater than regular price." },
            { status: 400 }
          );
      }
    }
    
    if (body.productType === "variable" && (!body.variants || body.variants.length === 0)) {
        return NextResponse.json(
          { success: false, message: "Variable products must contain at least one variant." },
          { status: 400 }
        );
    }

    await dbConnect();

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    // Handle variants based on productType
    let updatedVariantIds: any[] = [];

    if (body.productType === "simple") {
      // Find the first existing variant to repurpose, or create a new one
      const existingVariants = await ProductVariant.find({ productId: id });
      let simpleVariant;
      
      if (existingVariants.length > 0) {
        simpleVariant = existingVariants[0];
        simpleVariant.variantName = "Default";
        simpleVariant.sku = "";
        simpleVariant.regularPrice = body.regularPrice;
        simpleVariant.salePrice = body.salePrice;
        simpleVariant.quantity = body.quantity;
        simpleVariant.status = body.status || "active";
        await simpleVariant.save();
        
        // Delete any extra variants
        if (existingVariants.length > 1) {
          const extraIds = existingVariants.slice(1).map(v => v._id);
          await ProductVariant.deleteMany({ _id: { $in: extraIds } });
        }
      } else {
        simpleVariant = await ProductVariant.create({
          productId: id,
          variantName: "Default",
          sku: "",
          regularPrice: body.regularPrice,
          salePrice: body.salePrice,
          quantity: body.quantity,
          status: body.status || "active",
        });
      }
      updatedVariantIds.push(simpleVariant._id);

    } else if (body.productType === "variable" && body.variants) {
      const existingVariantIds = body.variants.filter((v: any) => v._id).map((v: any) => v._id);
      
      if (existingVariantIds.length > 0) {
        await ProductVariant.deleteMany({
          productId: id,
          _id: { $nin: existingVariantIds }
        });
      } else {
        await ProductVariant.deleteMany({ productId: id });
      }

      for (const variant of body.variants) {
        if (variant._id) {
          await ProductVariant.findByIdAndUpdate(variant._id, {
             ...variant,
             productId: id
          });
          updatedVariantIds.push(variant._id);
        } else {
          const newVar = await ProductVariant.create({
            ...variant,
            productId: id
          });
          updatedVariantIds.push(newVar._id);
        }
      }
    }

    // Attach variant IDs to product
    product.variants = updatedVariantIds;
    await product.save();

    return NextResponse.json(
      { success: true, message: "Product updated successfully.", product },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT Product Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product.", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const url = new URL(req.url);
    const force = url.searchParams.get("force");

    await dbConnect();

    if (force === "true") {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found." },
          { status: 404 }
        );
      }
      // Also delete variants
      await ProductVariant.deleteMany({ productId: id });

      return NextResponse.json(
        { success: true, message: "Product permanently deleted." },
        { status: 200 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() }, $unset: { status: 1 } },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Product deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product.", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();
    const body = await req.json();

    if (body.action === "restore") {
      const product = await Product.findByIdAndUpdate(
        id,
        { $unset: { deletedAt: 1 }, $set: { status: "inactive" } },
        { new: true }
      );

      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Product restored successfully." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid action." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("PATCH Product Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to perform action.", error: error.message },
      { status: 500 }
    );
  }
}
