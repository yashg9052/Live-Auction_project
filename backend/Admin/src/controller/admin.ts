import { sql } from "../config/db.js";
import getBuffer from "../utils/getBuffer.js";
import cloudinary from "cloudinary";
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
export interface AuctionItem {
  id: number;
  title: string;
  details: string;
  starting_price: number;
  current_highest_bid: number;
  current_highest_bidder_id: string | null;
  current_highest_bid_time: Date | null;
  images: string[] | null;
  category: string;
  auction_status: "ACTIVE" | "ENDED" | "DELETED" | "CANCELLED" | "PAUSED";
  ends_at: Date;
  bids: Record<string, any>[];
  created_at: Date;
  updated_at: Date;
}

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
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const { id } = req.params;

    const { title, details, startingPrice, category, endsAt, auction_status } =
      req.body;

    const existing = await sql`
  SELECT * FROM auction_items WHERE id = ${id} LIMIT 1
` as AuctionItem[];

if (!existing.length || !existing[0]) {
  return res.status(404).json({
    success: false,
    message: "Auction not found.",
  });
}

const auction: AuctionItem = existing[0]; // ✅ now safely typed, no undefined error

// use auction.title, auction.images etc. below
const updated = await sql`
  UPDATE auction_items
  SET
    title           = ${title?.trim() ?? auction.title},
    details         = ${details?.trim() ?? auction.details},
    starting_price  = ${startingPrice ? parseFloat(startingPrice) : auction.starting_price},
    category        = ${category ?? auction.category},
    ends_at         = ${endsAt ? new Date(endsAt) : auction.ends_at},
    auction_status  = ${auction_status ?? auction.auction_status},
    images          = ${auction.images},
    updated_at      = NOW()
  WHERE id = ${id}
  RETURNING *
` as AuctionItem[];

    return res.status(200).json({
      success: true,
      message: "Auction updated successfully.",
      auction: updated[0],
    });
  }
);

export const deleteAuctionItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user?.role !== "admin") {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { id: auctionId } = req.params;

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
