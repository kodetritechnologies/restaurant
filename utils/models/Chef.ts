import mongoose, { Schema, model, models } from "mongoose";

const ChefSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Chef name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Chef role is required"],
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: [true, "Chef profile image URL is required"],
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    facebook: {
      type: String,
      default: "",
      trim: true,
    },
    instagram: {
      type: String,
      default: "",
      trim: true,
    },
    twitter: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default models.Chef || model("Chef", ChefSchema);
