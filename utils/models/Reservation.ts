import { Schema, model, models } from "mongoose";

const ReservationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "Guests must be at least 1"],
    },
    date: {
      type: String,
      required: [true, "Reservation date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Reservation time is required"],
      trim: true,
    },
    request: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default models.Reservation || model("Reservation", ReservationSchema);
