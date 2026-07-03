import mongoose, { Schema, model, models } from "mongoose";

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
    shopPhone: {
      type: String,
      default: "+33 1 45 67 89 00",
      trim: true,
    },
    shopEmail: {
      type: String,
      default: "reserve@aurea.dining",
      trim: true,
    },
    shopAddress: {
      type: String,
      default: "12 Rue de l'Élégance, 75008 Paris",
      trim: true,
    },
    shortHours: {
      type: String,
      default: "Tue–Sun · 17:00 – 23:30",
      trim: true,
    },
    openHoursTueFri: {
      type: String,
      default: "Tuesday – Friday · 17:00 – 23:00",
      trim: true,
    },
    openHoursSatSun: {
      type: String,
      default: "Saturday – Sunday · 12:00 – 23:30",
      trim: true,
    },
    openHoursMon: {
      type: String,
      default: "Monday · Closed",
      trim: true,
    },
    instagramUsername: {
      type: String,
      default: "aurea.dining",
      trim: true,
    },
    facebookUsername: {
      type: String,
      default: "aurea.dining",
      trim: true,
    },
    twitterUsername: {
      type: String,
      default: "aurea.dining",
      trim: true,
    },
  },
  { timestamps: true }
);

export default models.Setting || model("Setting", SettingSchema);
