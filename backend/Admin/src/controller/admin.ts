import { sql } from "../config/db.js";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
export const createAuctionItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if(!req.user || req.user?.role!="Admin") {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      title,
      details,
      startingPrice,
      endsAt,
      category
    } = req.body;

    
    if (!title || !details || !startingPrice || !endsAt || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`   // adjust if using cloud storage
      : null;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Insert into PostgreSQL (Neon)
    const result = await sql`
      INSERT INTO auction_items
      (title, details, starting_price, current_highest_bid, images, category, ends_at)
      VALUES (
        ${title},
        ${details},
        ${startingPrice},
        ${startingPrice},
        ARRAY[${imageUrl}],
        ${category},
        ${endsAt}
      )
      RETURNING *;
    `;

    return res.status(201).json({
      message: "Auction created successfully",
      auction: result[0],
    });
   
  },
);
