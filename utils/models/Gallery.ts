import mongoose, { Schema, model, models } from "mongoose";

const GallerySchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "Interior",
      enum: ["Food", "Drinks", "Interior", "Events"],
    },
  },
  { timestamps: true }
);

export default models.Gallery || model("Gallery", GallerySchema);
