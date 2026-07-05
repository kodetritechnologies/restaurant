import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Category from "@/utils/models/Category";
import { verifyAdmin } from "@/utils/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Find all children and sub-children IDs to delete them recursively
    async function getCategoryIdsToDelete(categoryId: string): Promise<string[]> {
      let ids = [categoryId];
      const children = await Category.find({ parent: categoryId });
      for (const child of children) {
        const childIds = await getCategoryIdsToDelete(child._id.toString());
        ids = ids.concat(childIds);
      }
      return ids;
    }

    const idsToDelete = await getCategoryIdsToDelete(id);
    const deleteResult = await Category.deleteMany({ _id: { $in: idsToDelete } });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Category deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category.", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    // If name changes, we could re-generate slug, but usually slugs shouldn't change to avoid breaking links.
    // For simplicity, we just allow updating name, parent, order here.

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Category updated successfully.", category: updatedCategory },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category.", error: error.message },
      { status: 500 }
    );
  }
}
