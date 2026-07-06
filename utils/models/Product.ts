import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    featuredImage: {
      type: String,
      default: "",
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    regularPrice: {
      type: Number,
      default: 0,
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
    featured: {
      type: Boolean,
      default: false,
    },
    signature: {
      type: Boolean,
      default: false,
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }],
    productType: {
      type: String,
      enum: ["simple", "variable"],
      default: "simple",
    },
    status: {
      type: String,
      default: "active",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    variants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant"
    }],
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production") {
  delete models.Product;
}

export default models.Product || model("Product", ProductSchema);
