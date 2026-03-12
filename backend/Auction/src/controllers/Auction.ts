import TryCatch from "../utils/TryCatch.js";
import { sql } from "../config/db.js";
import { json, type Request, type Response } from "express";
import { getAuctionListKey, getAuctionDetailKey } from "../utils/key.js";
import { redisClient } from "../index.js";
import type { AuthenticatedRequest } from "../Middleware/isAuth.js";

export interface IAuction {
  id: number;
  title: string;
  current_highest_bid: number;
  images: string[];
  ending_at: string;
  auction_status: "ACTIVE" | "ENDED" | "CANCELLED";
  category: string;
  ends_at: string;
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
  current_highest_bid: number |null;
  current_highest_bidder_username:string|null;
  current_highest_bidder_id:string|null;
  current_highest_bid_time:Date|null;
  images: string[] | null;
  category: string;
  auction_status: "ACTIVE" | "ENDED" | "CANCELLED";
  ends_at: string;
  created_at: string;
  updated_at: string;
  bids: Ibid[] | null;
}
export const getAllAuctions = TryCatch(async (req: Request, res: Response) => {
  const auctionKey = getAuctionListKey();

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
      SELECT id, title, current_highest_bid, images,auction_status, ends_at,category,ends_at
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
    const auctionId = id as string;

    const auctionDetailKey = getAuctionDetailKey();

    if (redisClient.isReady) {
      const cached = await redisClient.hGet(auctionDetailKey, auctionId);

      if (cached) {
        console.log("Cache hit");

        const auction: IAuctiondetail = JSON.parse(cached);

        return res.status(200).json({
          message: "Auction fetched from cache",
          auction,
        });
      }
    }

    const [auctionRow] = (await sql`
  SELECT *
  FROM auction_items
  WHERE id = ${auctionId};
`) as IAuctiondetail[];

    if (!auctionRow) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }
    const bids = (await sql`
  SELECT * FROM bids WHERE auction_id = ${auctionId}
`) as Ibid[];

    const auctionData: IAuctiondetail = {
      id: auctionRow.id!,
      title: auctionRow.title!,
      details: auctionRow.details!,
      starting_price: auctionRow.starting_price!,
      current_highest_bid: auctionRow.current_highest_bid!,
      current_highest_bidder_id:auctionRow.current_highest_bidder_id,
      current_highest_bidder_username:auctionRow.current_highest_bidder_username,
      current_highest_bid_time:auctionRow.current_highest_bid_time,
      images: auctionRow.images ?? null,
      category: auctionRow.category!,
      auction_status: auctionRow.auction_status!,
      ends_at: auctionRow.ends_at!,
      created_at: auctionRow.created_at!,
      updated_at: auctionRow.updated_at!,
      bids,
    };

    if (redisClient.isReady) {
      await redisClient.hSet(
        auctionDetailKey,
        auctionId,
        JSON.stringify(auctionData),
      );

      const ttl = await redisClient.ttl(auctionDetailKey); // the timer is only set once and never reset by subsequent fetches.
      if (ttl === -1) {
        await redisClient.expire(auctionDetailKey, 120);
      }
    }

    return res.status(200).json({
      message: "Auction fetched successfully",
      auction: auctionData,
    });
  },
);

export const getActiveBids = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id.toString();

    const activeBids = await sql`
      SELECT 
        b.id,
        b.amount as yourBid,
        b.created_at,
        ai.id as auctionId,
        ai.title,
        ai.images,
        ai.current_highest_bid,
        ai.current_highest_bidder_id,
        ai.ends_at,
        ai.auction_status,
        CASE 
          WHEN ai.current_highest_bidder_id = ${userId} AND ai.auction_status = 'ACTIVE' THEN 'winning'
          WHEN b.user_id = ${userId} AND ai.current_highest_bidder_id != ${userId} AND ai.auction_status = 'ACTIVE' THEN 'outbid'
          ELSE 'outbid'
        END as status
      FROM bids b
      JOIN auction_items ai ON b.auction_id = ai.id
      WHERE b.user_id = ${userId} AND ai.auction_status = 'ACTIVE'
      ORDER BY b.created_at DESC
    `;

    const formattedBids = activeBids.map((bid: any) => ({
      id: bid.id,
      title: bid.title,
      imageUrl:
        bid.images && bid.images.length > 0
          ? bid.images[0]
          : "/placeholder.png",
      yourBid: Number(bid.yourbid),
      status: bid.status,
    }));

    return res.status(200).json({
      message: "Active bids retrieved successfully",
      data: formattedBids,
    });
  },
);

export const getWonItems = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id.toString();

    const wonItems = await sql`
      SELECT 
        ai.id,
        ai.title,
        ai.images,
        ai.current_highest_bid as yourBid,
        ai.ends_at
      FROM auction_items ai
      WHERE ai.current_highest_bidder_id = ${userId} AND ai.auction_status = 'ENDED'
      ORDER BY ai.ends_at DESC
    `;

    const formattedItems = wonItems.map((item: any) => ({
      id: item.id,
      title: item.title,
      imageUrl:
        item.images && item.images.length > 0
          ? item.images[0]
          : "/placeholder.png",
      yourBid: Number(item.yourbid),
      status: "won" as const,
    }));

    return res.status(200).json({
      message: "Won items retrieved successfully",
      data: formattedItems,
    });
  },
);
