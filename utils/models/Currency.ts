import mongoose, { Schema, Document } from "mongoose";

export interface ICurrency extends Document {
  name: string;
  code: string;
  symbol: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const currencySchema = new Schema<ICurrency>(
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

// If this currency is set as default, unset others before saving
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
export default mongoose.model<ICurrency>("Currency", currencySchema);
