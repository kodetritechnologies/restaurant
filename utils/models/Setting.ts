import { Schema, model, models } from "mongoose";

const SettingSchema = new Schema(
  {
    showBanner: {
      type: Boolean,
      default: false,
    },
    bannerText: {
      type: String,
      default: "",
      trim: true,
    },
    restaurantLogo: {
      type: String,
      default: "",
      trim: true,
    },
    shopPhone: {
      type: String,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },
    shopEmail: {
      type: String,
      trim: true,
    },
    shopAddress: {
      type: String,
      trim: true,
    },
    shortHours: {
      type: String,
      trim: true,
    },
    openHoursTueFri: {
      type: String,
      trim: true,
    },
    openHoursSatSun: {
      type: String,
      trim: true,
    },
    openHoursMon: {
      type: String,
      trim: true,
    },
    instagramUsername: {
      type: String,
      trim: true,
    },
    facebookUsername: {
      type: String,
      trim: true,
    },
    twitterUsername: {
      type: String,
      trim: true,
    },
    shopDescription: {
      type: String,
      trim: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    isDeliveryFeeActive: {
      type: Boolean,
      default: false,
    },
    cancellationTimeLimit: {
      type: Number,
      default: 5,
    },
    tableCount: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

export default models.Setting || model("Setting", SettingSchema);
