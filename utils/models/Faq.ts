import { Schema, model, models } from "mongoose";

const FaqSchema = new Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

export default models.Faq || model("Faq", FaqSchema);
