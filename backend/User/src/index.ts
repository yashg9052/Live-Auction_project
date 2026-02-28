import express from "express";
import dotenv from "dotenv";
dotenv.config();
import UserRouter from "./Routes/User.js";
import { connectDb } from "./config/db.js";
import { createClient } from "redis";
import { connectRabbitMq } from "./config/rabbitMq.js";

const app = express();
app.use(express.json());
export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
});
redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);

const PORT = process.env.PORT;
await connectDb()
await connectRabbitMq().then(() =>
  console.log("RabbitMQ connected successfully"),
);
app.use("/api/v1", UserRouter);
app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
