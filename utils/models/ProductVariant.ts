import mongoose, { Schema, model, models } from "mongoose";

const ProductVariantSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantName: {
      type: String,
      required: [true, "Variant name is required"],
      trim: true,
    },
    sku: {
      type: String,
      default: "",
      trim: true,
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    regularPrice: {
      type: Number,
      required: [true, "Variant regular price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
    },
    quantity: {
      type: Number,
      default: null,
      min: [0, "Quantity cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production") {
  delete models.ProductVariant;
}

export default models.ProductVariant || model("ProductVariant", ProductVariantSchema);
