import mongoose from "mongoose";

let isConnected = false;

export default async function dbConnect() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(
      `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASS}@ac-dwrpxci-shard-00-00.o4cvr9a.mongodb.net:27017,ac-dwrpxci-shard-00-01.o4cvr9a.mongodb.net:27017,ac-dwrpxci-shard-00-02.o4cvr9a.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-jhv7w4-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kodetritechnologies`
    );

    isConnected = db.connections[0].readyState === 1;

    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Connection Error ❌", error);
  }
}
