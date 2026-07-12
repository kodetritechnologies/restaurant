import { Schema, model, models } from "mongoose";

const CredentialSchema = new Schema(
  {
    razorpay: {
      key: { type: String, default: "" },
      secret: { type: String, default: "" },
      isActive: { type: Boolean, default: false }
    },
    cod: {
      isActive: { type: Boolean, default: true }
    },
    payLater: {
      isActive: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export default models.Credential || model("Credential", CredentialSchema);
