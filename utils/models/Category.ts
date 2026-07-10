import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
    public_id: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: "General",
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    }
  },
  { timestamps: true }
);

export default models.Category || model("Category", CategorySchema);
