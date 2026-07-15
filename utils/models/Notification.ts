import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400 // TTL index: Automatically deletes document after 24 hours (86400 seconds)
    }
  }
);

export default models.Notification || model("Notification", NotificationSchema);
