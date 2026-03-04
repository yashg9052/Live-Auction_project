import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

export const sql = neon(process.env.DB_URL as string);

export async function initDB() {
  try {
    await sql`
      DO $$ BEGIN
        CREATE TYPE auction_status_enum AS ENUM (
          'ACTIVE',
          'ENDED',
          'DELETED',
          
          
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auction_items (
        id SERIAL PRIMARY KEY,

        title VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,

        starting_price DOUBLE PRECISION NOT NULL,
        current_highest_bid DOUBLE PRECISION DEFAULT 0,
        current_highest_bidder_id TEXT,
        current_highest_bid_time TIMESTAMP,



        images TEXT[],

        category TEXT NOT NULL,

        auction_status auction_status_enum DEFAULT 'ACTIVE',

        ends_at TIMESTAMP NOT NULL,
        bids 

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing DB:", error);
  }
}
