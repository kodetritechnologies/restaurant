import mongoose, { Schema, Document } from "mongoose";

const currencySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

currencySchema.pre("save", async function () {
  if (this.isDefault) {
    const CurrencyModel = this.constructor as mongoose.Model<any>;
    await CurrencyModel.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

if (mongoose.models.Currency) {
  delete mongoose.models.Currency;
}

export default mongoose.model("Currency", currencySchema);
