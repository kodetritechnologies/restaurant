import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [orderItemSchema],
    deliveryType: {
      type: String,
      enum: ["delivery", "pickup", "dinein"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "payLater", "razorpay"],
      required: true,
    },
    paymentMode: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    customerDetails: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      tableNumber: String,
      note: String,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
