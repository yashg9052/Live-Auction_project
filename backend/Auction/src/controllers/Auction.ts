import TryCatch from "../utils/TryCatch.js";
import { sql } from "../config/db.js";
import { json, type Request, type Response } from "express";
import { getKeyName } from "../utils/key.js";
import { redisClient } from "../index.js";

export interface IAuction {
  id: number;
  title: string;
  current_highest_bid: number;
  images: string[];
  ending_at: string;
  auction_status: "ACTIVE" | "ENDED" | "CANCELLED";
}
export interface Ibid {
  id: string;
  amount: number;
  created_at: string;
  approved_at: string;
  auction_id: number;
  user_id: string;
}
export interface IAuctiondetail {
  id: number;
  title: string;
  details: string;
  starting_price: number;
  current_highest_bid: number;
  images: string[] | null;
  category: string;
  auction_status: "ACTIVE" | "ENDED" | "CANCELLED";
  ends_at: string;
  created_at: string;
  updated_at: string;
  bids: Ibid[] |null;
}
export const getAllAuctions = TryCatch(async (req: Request, res: Response) => {
  const auctionKey = getKeyName("auction", "list");

  if (redisClient.isReady) {
    const cached = await redisClient.hGetAll(auctionKey);

    if (Object.keys(cached).length > 0) {
      console.log("Cache hit");

      const auctions: IAuction[] = Object.values(cached).map((a) =>
        JSON.parse(a),
      );

      return res.status(200).json({
        message: "Auctions fetched from cache",
        auctions,
      });
    }
  }

  const auctions = (await sql`
      SELECT id, title, current_highest_bid, images,auction_status, ends_at
      FROM auction_items
      ORDER BY created_at DESC;
    `) as IAuction[];

  if (redisClient.isReady && auctions.length > 0) {
    const hashData: Record<string, string> = {};

    auctions.forEach((auction) => {
      hashData[auction.id.toString()] = JSON.stringify(auction);
    });

    await redisClient.hSet(auctionKey, hashData);
    await redisClient.expire(auctionKey, 60);
  }

  return res.status(200).json({
    message: "Auctions fetched from database",
    auctions,
  });
});
export const getSingleAuctionDetail = TryCatch(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Auction ID is required",
      });
    }

    const auctionDetailKey = getKeyName("auction", id as string);

    if (redisClient.isReady) {
      const cached = await redisClient.get(auctionDetailKey);

      if (cached) {
        console.log("Cache hit");

        const auction: IAuctiondetail[] = JSON.parse(cached);

        return res.status(200).json({
          message: "Auction fetched from cache",
          auction,
        });
      }
    }

const [auctionRow] = (await sql`
  SELECT *
  FROM auction_items
  WHERE id = ${id};
`)as IAuctiondetail[];

if (!auctionRow) {
  return res.status(404).json({
    message: "Auction not found",
  });
}
const bids = await (sql`
  SELECT * FROM bids WHERE auction_id = ${id}
`)as Ibid[];

const auctionData: IAuctiondetail = {
  id: auctionRow.id!,
  title: auctionRow.title!,
  details: auctionRow.details!,
  starting_price: auctionRow.starting_price!,
  current_highest_bid: auctionRow.current_highest_bid!,
  images: auctionRow.images ?? null,
  category: auctionRow.category!,
  auction_status: auctionRow.auction_status!,
  ends_at: auctionRow.ends_at!,
  created_at: auctionRow.created_at!,
  updated_at: auctionRow.updated_at!,
  bids,
};
    

    if (redisClient.isReady) {
      await redisClient.set(auctionDetailKey, JSON.stringify(auctionData), {
        EX: 120,
      });
    }

    return res.status(200).json({
      message: "Auction fetched successfully",
      auction: auctionData,
    });
  },
);
