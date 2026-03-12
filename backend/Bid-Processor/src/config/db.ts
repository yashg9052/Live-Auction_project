import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { Db, MongoClient } from "mongodb";
dotenv.config();
import mongoose from "mongoose";

export const sql = neon(process.env.DB_URL as string);

export async function initDB() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
    await sql`CREATE TABLE IF NOT EXISTS  bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    auction_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL, 
    
    CONSTRAINT fk_auction
        FOREIGN KEY (auction_id)
        REFERENCES auction_items(id)
        ON DELETE CASCADE
);`;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing DB:", error);
  }
}
const client = new MongoClient(process.env.MONGO_URI as string);
let db: Db | null = null;

export const connectDB = async (): Promise<Db> => {
  if (db) return db;
  await client.connect();
  db = client.db("auction_system"); 
  console.log("✅ MongoDB connected");
  return db;
};

export const getDB = (): Db => {
  if (!db) throw new Error("MongoDB not initialized. Call connectDB() first.");
  return db;
};

export const closeDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    db = null;
    console.log("MongoDB connection closed");
  }
};
