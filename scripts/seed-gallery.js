/**
 * Seed Script — Gallery Images
 * Seeds the MongoDB gallery collection with local static images.
 * Run once: node scripts/seed-gallery.js
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const MONGO_URI = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASS}@ac-dwrpxci-shard-00-00.o4cvr9a.mongodb.net:27017,ac-dwrpxci-shard-00-01.o4cvr9a.mongodb.net:27017,ac-dwrpxci-shard-00-02.o4cvr9a.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-jhv7w4-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kodetritechnologies`;

const GallerySchema = new mongoose.Schema(
  {
    url:       { type: String, required: true },
    publicId:  { type: String, default: "" },
    title:     { type: String, default: "" },
    category:  { type: String, default: "Interior", enum: ["Food", "Drinks", "Interior", "Events"] },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);

const GALLERY_ITEMS = [
  { url: "/assets/gallery/interior-1.png", publicId: "local/interior-1", title: "Our Dining Room",    category: "Interior", description: "A warm and elegant dining experience." },
  { url: "/assets/gallery/food-1.png",     publicId: "local/food-1",     title: "Signature Steak",    category: "Food",     description: "Our chef's signature dry-aged steak." },
  { url: "/assets/gallery/food-2.png",     publicId: "local/food-2",     title: "Chocolate Delight",  category: "Food",     description: "Decadent chocolate lava cake with gold leaf." },
  { url: "/assets/gallery/drinks-1.png",   publicId: "local/drinks-1",   title: "Craft Cocktails",    category: "Drinks",   description: "Handcrafted cocktails by our master mixologists." },
  { url: "/assets/gallery/interior-2.png", publicId: "local/interior-2", title: "Private Dining",     category: "Interior", description: "Exclusive private dining for special occasions." },
  { url: "/assets/gallery/food-3.png",     publicId: "local/food-3",     title: "Seafood Platter",    category: "Food",     description: "Fresh daily seafood selection." },
  { url: "/assets/gallery/events-1.png",   publicId: "local/events-1",   title: "Special Events",     category: "Events",   description: "Unforgettable evenings for every celebration." },
  { url: "/assets/gallery/drinks-2.png",   publicId: "local/drinks-2",   title: "Fine Wine Service",  category: "Drinks",   description: "Curated wine cellar with world-class selections." },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected ✅");

    // Only insert items that don't already exist (by publicId)
    let inserted = 0;
    for (const item of GALLERY_ITEMS) {
      const exists = await Gallery.findOne({ publicId: item.publicId });
      if (!exists) {
        await Gallery.create(item);
        console.log(`  ✅ Inserted: ${item.title}`);
        inserted++;
      } else {
        console.log(`  ⏭  Skipped (already exists): ${item.title}`);
      }
    }

    console.log(`\nDone! ${inserted} item(s) inserted.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed Error ❌", err);
    process.exit(1);
  }
}

seed();
