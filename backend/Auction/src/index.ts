import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import auctionroutes from "./Routes/Auction.js";
import { createClient } from "redis";
export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
});
redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);
const app = express();

const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use(express.json());
app.use("/api/v1", auctionroutes);
app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
