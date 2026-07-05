import mongoose, { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Reviewer name is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
    },
    imgUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
  },
  { timestamps: true }
);

export default models.Review || model("Review", ReviewSchema);
