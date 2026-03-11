import { sql } from "../config/db.js";
import getBuffer from "../utils/getBuffer.js";
import cloudinary from "cloudinary";
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { channel } from "../config/rabbitMq.js";
import { redisClient } from "../index.js";
import { getAuctionListKey } from "../utils/key.js";
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
    // put auction in delay queue after that delay is over put in auction end queue
    if (channel) {
      try {
        await channel.assertExchange("auction_exchange", "direct", {
          durable: true,
        });
        await channel.assertQueue("auction_end_queue", { durable: true });
        await channel.assertQueue("auction_delay_queue", {
          durable: true,
          deadLetterExchange: "auction_exchange",
          deadLetterRoutingKey: "auction_end",
        });
        await channel.bindQueue(
          "auction_end_queue",
          "auction_exchange",
          "auction_end",
        );
        // the bid is kept in delay queue and then it is sent to end queue(which is dead letter queue here) when it reaches its time to live(TTL)
        const delay = new Date(endsAt).getTime() - Date.now();
        channel.sendToQueue(
          "auction_delay_queue",
          Buffer.from(
            JSON.stringify({
              auctionId: result[0]?.id,
            }),
          ),
          {
            expiration: delay.toString(),
          },
        );
      } catch (error: any) {
        console.log(error);
        res.status(500).json({
          message: "Failed to queue auction end time",
        });
      }
    }
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
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Auction id not found",
      });
    }
    const { title, details, startingPrice, category, endsAt, auction_status } =
      req.body;

    const existing = (await sql`
      SELECT * FROM auction_items WHERE id = ${id} LIMIT 1
    `) as AuctionItem[];

    if (!existing.length || !existing[0]) {
      return res.status(404).json({
        success: false,
        message: "Auction not found.",
      });
    }

    const auction: AuctionItem = existing[0];

    const updated = (await sql`
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
    `) as AuctionItem[];
    if (!updated.length || !updated[0]) {
      return res.status(404).json({
        success: false,
        message: "Failed to update auction.",
      });
    }

    const updatedAuction = updated[0];

    try {
      const auctionKey = getAuctionListKey();

      if (redisClient.isReady) {
        if (auction_status === "DELETED" || auction_status === "CANCELLED") {
          // Remove this auction from the hash entirely
          await redisClient.hDel(auctionKey, id.toString());
          console.log(`Redis: removed auction ${id} from cache`);
        } else {
          // Update just this auction's field in the hash
          await redisClient.hSet(
            auctionKey,
            id.toString(),
            JSON.stringify({
              id: updatedAuction.id,
              title: updatedAuction.title,
              current_highest_bid: updatedAuction.current_highest_bid,
              images: updatedAuction.images,
              auction_status: updatedAuction.auction_status,
              ends_at: updatedAuction.ends_at,
              category: updatedAuction.category,
            }),
          );
          console.log(`Redis: updated auction ${id} in cache`);
        }
      }
    } catch (error) {
      console.error(`Redis sync failed for auction ${id}:`, error);
    }

    if (
      auction.auction_status !== "ENDED" &&
      updatedAuction?.auction_status === "ENDED"
    ) {
      channel.publish(
        "auction_exchange",
        "auction_ended",
        Buffer.from(
          JSON.stringify({
            auctionId: id,
          }),
        ),
      );
    }

    return res.status(200).json({
      success: true,
      message: "Auction updated successfully.",
      auction: updatedAuction,
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
