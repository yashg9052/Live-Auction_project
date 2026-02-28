import express from "express";
import dotenv from "dotenv";
dotenv.config();
import adminRouter from "./Routes/admin.js";
import { initDB } from "./config/db.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
await initDB().then(() => {
  console.log("Database initialized");
}).catch((error) => {
  console.log("Error initializing database", error);
});

app.use("/api/v1", adminRouter);
app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
