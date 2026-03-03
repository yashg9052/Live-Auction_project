import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { startSendOtpConsumer } from "./consumer.js";
import cors from "cors"


const app = express();
const port = process.env.PORT;


// export const redisClient = createClient({
//   url: process.env.REDIS_URL as string,
// });
// redisClient
//   .connect()
//   .then(() => console.log("connected to redis"))
//   .catch(console.error);

startSendOtpConsumer();
// connectDb();
// connectRabbitMq();
app.use(cors())
// app.use("api/v1",UserRoutes)
app.listen(port, () => {
  console.log(`Listening to ${port}`);
});
