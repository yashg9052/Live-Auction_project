import { redisClient } from "./index.js";
import { sql } from "./config/db.js";
import { consumeFromQueue } from "./config/rabbitMq.js";
import { io } from "./config/socket.js";
import { channel } from "./config/rabbitMq.js";
import { getHighestBidKey } from "./utils/key.js";
export interface AuctionItem {
  auction_status: "ACTIVE" | "ENDED" | "DELETED" | "CANCELLED" | "PAUSED";
  ends_at: Date;
}
interface Bid {
  id: string;
  amount: number;
  created_at: string;
  approved_at: string;
  auction_id: number;
  user_id: string;
  username: string;
}
interface FinalDataOfAuction {
  current_highest_bidder_username: string;
  current_highest_bidder_id: string;
  current_highest_bid: number;
}

export const processBids = async () => {
  await consumeFromQueue("bid_queue", async (bid) => {
    console.log("Processing bid...");

    const { userId, auctionId, amount, bidTime, username } = bid;
    console.log(userId, auctionId, amount, bidTime);

    if (!auctionId || !amount || !userId) {
      console.log("Invalid bid data:", bid);
      return;
    }

    const createdAt = bidTime ? new Date(bidTime) : new Date();

    // First check if this bid would become the highest
    const updatedAuction = await sql`
      UPDATE auction_items
      SET 
        current_highest_bid = ${amount},
        current_highest_bidder_id = ${userId},
        current_highest_bid_time = ${createdAt},
        current_highest_bidder_username = ${username},
        updated_at = NOW()
      WHERE id = ${auctionId}
        AND (
          ${amount} > current_highest_bid
          OR (
            ${amount} = current_highest_bid
            AND ${createdAt} < current_highest_bid_time
          )
        )
      RETURNING 
        current_highest_bid,
        current_highest_bidder_id,
        current_highest_bid_time,
        current_highest_bidder_username
    `;

    // Only insert and emit if this bid became the highest
    if (updatedAuction.length > 0) {
      const result = (await sql`
        INSERT INTO bids (amount, created_at, auction_id, user_id, username)
        VALUES (${amount}, ${createdAt}, ${auctionId}, ${userId}, ${username})
        RETURNING *
      `) as Bid[];

      if (!result.length) throw new Error("Failed to insert bid");

      const newBid = result[0];

      const hashKey = getHighestBidKey();
      io.to(`auction_${auctionId}`).emit("new-highest-bid", newBid);
      await redisClient.hSet(hashKey, {
        [`${auctionId}:amount`]: amount.toString(),
        [`${auctionId}:userId`]: userId,
        [`${auctionId}:winningTime`]: createdAt.toISOString(),
        [`${auctionId}:approvedAt`]: new Date().toISOString(),
      });

      console.log(`New highest bid for auction ${auctionId}: ${amount}`);
    } else {
      console.log(
        `Bid of ${amount} rejected — not higher than current highest`,
      );
    }
  });
};

export const endAuctions = async () => {
  if (!channel) {
    console.log("Rabbitmq channel is not initialized");
    return;
  }
  await channel.assertExchange("auction_exchange", "direct", {
    durable: true,
  });
  await channel.assertQueue("auction_end_queue", { durable: true });
  await channel.bindQueue(
    "auction_end_queue",
    "auction_exchange",
    "auction_end",
  );
  channel.prefetch(1);
  // RabbitMQ sends only one message at a time because of prefetch
  channel.consume("auction_end_queue", async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());
    const { auctionId } = data;
    // check if user has updated ends_at or ended the auction if yes return ack
    const auction = (await sql`
    SELECT auction_status, ends_at FROM auction_items
    WHERE id = ${auctionId}
  `) as AuctionItem[];
    const auctionItem = auction[0];
    if (!auctionItem) {
      channel.ack(msg);
      return;
    }

    const now = new Date();
    // it is already ended
    if (auctionItem.auction_status === "ENDED") {
      channel.ack(msg);
      return;
    }
    // admin extended ends_at
    if (auctionItem.ends_at > now) {
      channel.ack(msg);
      return;
    }
    const finalDataOfAuction = (await sql`
    UPDATE auctions
    SET status='ENDED'
    WHERE id=${auctionId}
    RETURNING current_highest_bidder_id,current_highest_bidder_username,current_highest_bid
  `) as FinalDataOfAuction[];
    const auctionData = finalDataOfAuction[0];
    if (!auctionData) {
      channel.ack(msg);
      return;
    }
    io.to(`auction_${auctionId}`).emit("auctionEnded", {
      auctionId,
      winner: auctionData?.current_highest_bidder_username,
      winnerId: auctionData?.current_highest_bidder_id,
      amount: auctionData?.current_highest_bid,
    });
    console.log("Auction ended:", auctionId);
    channel.ack(msg);
  });
};
