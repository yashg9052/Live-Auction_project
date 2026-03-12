import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors"
import adminRouter from "./Routes/admin.js";
import { connectDB, initDB } from "./config/db.js";
import { setupcloudinary } from "./config/cloudinary.js";
import { createClient } from "redis";
import { connectRabbitMq } from "./config/rabbitMq.js";
const app = express();
app.use(express.json());

const PORT = process.env.PORT;
setupcloudinary();
export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
});
redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);
await connectRabbitMq().then(() =>
  console.log("RabbitMQ connected successfully"),
);
await initDB()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((error) => {
    console.log("Error initializing database", error);
  });
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
await connectDB();
app.use("/api/v1", adminRouter);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
