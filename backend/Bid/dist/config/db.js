// import { neon } from "@neondatabase/serverless";
// import dotenv from "dotenv";
// dotenv.config();
export {};
// export const sql = neon(process.env.DB_URL as string);
// export async function initDB() {
//   try {
//     await sql`
//       DO $$ BEGIN
//         CREATE TYPE auction_status_enum AS ENUM (
//           'ACTIVE',
//           'ENDED',
//           'DELETED',
//           'LOCKED',
//           'COMPLETED'
//         );
//       EXCEPTION
//         WHEN duplicate_object THEN null;
//       END $$;
//     `;
//     await sql`
//       CREATE TABLE IF NOT EXISTS auction_items (
//         id SERIAL PRIMARY KEY,
//         title VARCHAR(255) NOT NULL,
//         details TEXT NOT NULL,
//         starting_price DOUBLE PRECISION NOT NULL,
//         current_highest_bid DOUBLE PRECISION DEFAULT 0,
//         current_highest_bidder_id TEXT,
//         current_highest_bid_time TIMESTAMP,
//         images TEXT[],
//         category TEXT NOT NULL,
//         auction_status auction_status_enum DEFAULT 'ACTIVE',
//         ends_at TIMESTAMP NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `;
//     await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`
//     await sql`CREATE TABLE IF NOT EXISTS  bids (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     amount DOUBLE PRECISION NOT NULL,
//     created_at TIMESTAMP NOT NULL,
//     approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     auction_id INTEGER NOT NULL,
//     user_id TEXT NOT NULL,
//     username TEXT NOT NULL 
//     CONSTRAINT fk_auction
//         FOREIGN KEY (auction_id)
//         REFERENCES auction_items(id)
//         ON DELETE CASCADE
// );`
//     console.log("Database initialized successfully");
//   } catch (error) {
//     console.error("Error initializing DB:", error);
//   }
// }
//# sourceMappingURL=db.js.map