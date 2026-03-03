import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

export const sql = neon(process.env.DB_URL as string);


export async function initDB() {
  try {
    
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`
    await sql`CREATE TABLE IF NOT EXISTS  bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    auction_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    
    CONSTRAINT fk_auction
        FOREIGN KEY (auction_id)
        REFERENCES auction_items(id)
        ON DELETE CASCADE
);`
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing DB:", error);
  }
}
