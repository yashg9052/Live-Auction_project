import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";
import bidRoutes from "./Routes/Bid.js";
import { connectRabbitMq } from "./config/rabbitMq.js";
import cors from "cors"
// import { processBids } from "./config/Worker.js";
// import { initDB } from "./config/db.js";
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
// await initDB().then(()=>console.log("Database initialized"))
// processBids();
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use("/api/v1", bidRoutes);
app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
