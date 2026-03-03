import mongoose from "mongoose";
export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "auction_system",
    });
    console.log("MongoDb connected");
  } catch (error) {
    console.error(error);
  }
};