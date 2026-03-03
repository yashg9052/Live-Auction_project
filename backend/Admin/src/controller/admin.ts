import { sql } from "../config/db.js";
import getBuffer from "../utils/getBuffer.js";
import cloudinary from "cloudinary";
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";

export const createAuctionItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user?.role !== "admin") {
      {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
    }

    const { title, details, startingPrice, endsAt, category } = await req.body;

    if (!title || !details || !startingPrice || !endsAt || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const image = req.file;
    const imageBuffer = getBuffer(image);
    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }
    if (!imageBuffer || !imageBuffer.content) {
      res.status(500).json({
        message: "Failed to generate file buffer",
      });
      return;
    }
    const cloud = await cloudinary.v2.uploader.upload(imageBuffer.content);

    const result = await sql`
      INSERT INTO auction_items
      (title, details, starting_price, current_highest_bid, images, category, ends_at)
      VALUES (
        ${title},
        ${details},
        ${startingPrice},
        ${startingPrice},
        ARRAY[${cloud.secure_url}],
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

export const updateAuctionItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user?.role !== "admin") {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      id: auctionId,
      title,
      details,
      startingPrice,
      endsAt,
      category,
      auction_status,
    } = req.body;

    if (!auctionId) {
      return res.status(400).json({ message: "Auction ID is required" });
    }

    if (auction_status) {
      const validStatuses = [
        "ACTIVE",
        "ENDED",
        "CANCELLED",
        "DRAFT",
        "PAUSED",
        "DELETED",
      ];
      if (!validStatuses.includes(auction_status.toUpperCase())) {
        return res.status(400).json({ message: "Invalid status" });
      }
    }

    let newImageUrl = null;
    if (req.file) {
      const imageBuffer = getBuffer(req.file);
      if (imageBuffer && imageBuffer.content) {
        const cloud = await cloudinary.v2.uploader.upload(imageBuffer.content);
        newImageUrl = cloud.secure_url;
      }
    }

    const result = await sql`
      UPDATE auction_items
      SET 
        title = COALESCE(${title || null}, title),
        details = COALESCE(${details || null}, details),
        starting_price = COALESCE(${startingPrice || null}, starting_price),
        ends_at = COALESCE(${endsAt || null}, ends_at),
        category = COALESCE(${category || null}, category),
        auction_status = COALESCE(${auction_status?.toUpperCase() || null}, auction_status),
        images = CASE 
          WHEN ${newImageUrl} IS NOT NULL THEN array_append(COALESCE(images, ARRAY[]::text[]), ${newImageUrl})
          ELSE images
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${auctionId}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Auction not found" });
    }

    return res.status(200).json({
      message: "Auction updated successfully",
      auction: result[0],
    });
  },
);

export const deleteAuctionItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user?.role !== "admin") {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { id: auctionId } = req.body;

    if (!auctionId) {
      return res.status(400).json({ message: "Auction ID is required" });
    }

    const result = await sql`
      UPDATE auction_items
      SET auction_status = 'DELETED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${auctionId}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Auction not found" });
    }

    return res.status(200).json({
      message: "Auction deleted successfully",
      auction: result[0],
    });
  },
);

// export const approveBid = TryCatch(async (req: AuthenticatedRequest, res) => {
//   if (!req.user || req.user?.role !== "admin") {
//     return res.status(401).json({
//       message: "Unauthorized - Admin access required",
//     });
//   }

//   try {
//     // Consume all messages from bid_queue
//     const allBids = await consumeFromQueue("bid_queue", async (bid) => {
//       // Write each bid to database
//       const { userId, email, username, auctionId, amount, bidTime, timestamp } =
//         bid;

//       if (!auctionId || !amount || !userId) {
//         console.log("Invalid bid data:", bid);
//         return;
//       }

//       // Insert bid into database with created_at from queue timestamp
//       await sql`
//         INSERT INTO bids (amount, created_at, auction_id, user_id)
//         VALUES (${amount}, ${bidTime || timestamp}, ${auctionId}, ${userId})
//       `;
//     });

//     if (allBids.length === 0) {
//       return res.status(200).json({
//         message: "No bids found in queue",
//         processedBids: 0,
//       });
//     }

//     // Group bids by auctionId and find highest bid for each auction
//     const bidsByAuction: {
//       [key: string]: Array<{
//         userId: string;
//         amount: number;
//         bidTime: Date;
//       }>;
//     } = {};

//     allBids.forEach((bid: any) => {
//       if (!bidsByAuction[bid.auctionId]) {
//         bidsByAuction[bid.auctionId] = [];
//       }
//       const auctionBidList = bidsByAuction[bid.auctionId];
//       if (auctionBidList) {
//         auctionBidList.push({
//           userId: bid.userId,
//           amount: bid.amount,
//           bidTime: new Date(bid.bidTime || bid.timestamp),
//         });
//       }
//     });

//     const results: any[] = [];

//     // Process each auction's bids
//     for (const auctionId in bidsByAuction) {
//       const auctionBids = bidsByAuction[auctionId];
      
//       if (!auctionBids || auctionBids.length === 0) {
//         continue;
//       }

//       // Find the highest bid
//       // If multiple bids have same amount, choose the one with earliest time
//       const highestBid = auctionBids.reduce((highest, current) => {
//         if (current.amount > highest.amount) {
//           return current;
//         } else if (current.amount === highest.amount) {
//           // Same amount, choose earlier time
//           return current.bidTime < highest.bidTime ? current : highest;
//         }
//         return highest;
//       });

//       // Update the approved bid with current timestamp
//       const approvedBidResult = await sql`
//         UPDATE bids
//         SET approved_at = CURRENT_TIMESTAMP
//         WHERE 
//           auction_id = ${auctionId} 
//           AND amount = ${highestBid.amount}
//           AND user_id = ${highestBid.userId}
//           AND created_at = ${highestBid.bidTime}
//         RETURNING *;
//       `;

//       // Update auction's current highest bid
//       await sql`
//         UPDATE auction_items
//         SET current_highest_bid = ${highestBid.amount}
//         WHERE id = ${auctionId};
//       `;

//       // Store in Redis
//       const redisKey = `auction:${auctionId}:highest_bid`;
//       await redisClient.hSet(redisKey, {
//         amount: highestBid.amount.toString(),
//         userId: highestBid.userId,
//         winningTime: highestBid.bidTime.toISOString(),
//         approvedAt: new Date().toISOString(),
//       });

//       results.push({
//         auctionId,
//         totalBidsForAuction: auctionBids.length,
//         approvedBid: {
//           userId: highestBid.userId,
//           amount: highestBid.amount,
//           createdAt: highestBid.bidTime,
//           approvedAt: new Date(),
//         },
//       });
//     }

//     return res.status(200).json({
//       message: "Bids processed and approved successfully",
//       processedBids: allBids.length,
//       auctionsProcessed: results.length,
//       results,
//     });
//   } catch (error) {
//     console.log("Error in approveBid:", error);
//     return res.status(500).json({
//       message: "Error processing bids",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// });
