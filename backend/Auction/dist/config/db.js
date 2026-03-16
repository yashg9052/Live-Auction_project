import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();
export const sql = neon(process.env.DB_URL);
export async function initDB() {
    try {
        await sql `
  CREATE TABLE IF NOT EXISTS auction_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    starting_price DOUBLE PRECISION NOT NULL,
    current_highest_bid DOUBLE PRECISION DEFAULT 0,
    current_highest_bidder_id TEXT,
    current_highest_bid_time TIMESTAMP,
    current_highest_bidder_username TEXT,
    images TEXT[],
    category TEXT NOT NULL,
    auction_status auction_status_enum DEFAULT 'ACTIVE',
    ends_at TIMESTAMP NOT NULL,
    bids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
    }
    catch (error) {
        console.log("Error initDb", error);
    }
}
//# sourceMappingURL=db.js.map