import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Category from "@/utils/models/Category";
import { verifyAdmin } from "@/utils/lib/auth";

// Helper function to create a unique slug
async function generateUniqueSlug(name: string) {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, ""); // Remove trailing/leading hyphens

  if (!baseSlug) return "category-" + Date.now();

  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    } else {
      exists = false;
    }
  }

  return slug;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const type = searchParams.get("type");

    let query: any = {};
    if (featured === "true") {
      query.featured = true;
    }

    if (type) {
      // Case-insensitive regex match for type
      query.type = { $regex: new RegExp(`^${type}$`, "i") };
    }

    await dbConnect();
    // Return all categories based on query
    const categories = await Category.find(query).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error: any) {
    console.error("GET Categories Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories.", error: error.message },
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
    const { name, parent, image, public_id, type, featured, description } = body;

    const names = name.split(",").map((n: string) => n.trim()).filter(Boolean);

    if (names.length === 0) {
      return NextResponse.json(
        { success: false, message: "Category name is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    let baseOrder = await Category.countDocuments();
    const createdCategories = [];

    for (const singleName of names) {
      const uniqueSlug = await generateUniqueSlug(singleName);
      const newCategory = await Category.create({
        name: singleName,
        slug: uniqueSlug,
        parent: parent || null,
        image: image || "",
        public_id: public_id || "",
        type: type || "General",
        featured: featured || false,
        description: description || "",
        order: baseOrder++,
      });
      createdCategories.push(newCategory);
    }

    return NextResponse.json(
      {
        success: true,
        message: `${createdCategories.length} category(s) created successfully.`,
        category: createdCategories[0] // fallback for frontend relying on singular `category`
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category.", error: error.message },
      { status: 500 }
    );
  }
}
