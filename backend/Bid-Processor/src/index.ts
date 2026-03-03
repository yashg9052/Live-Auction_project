import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";
import { connectRabbitMq } from "./config/rabbitMq.js";
import { processBids } from "./Consumer.js";
import { initDB } from "./config/db.js";
const app = express();
app.use(express.json());


const PORT = process.env.PORT;
export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
});
redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);
await connectRabbitMq();
await initDB()
processBids();
app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
