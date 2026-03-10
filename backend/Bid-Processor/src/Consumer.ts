import { redisClient } from "./index.js";
import { sql } from "./config/db.js";
import { consumeFromQueue } from "./config/rabbitMq.js";
import { io } from "./config/socket.js";
interface Bid {
  id: string;
  amount: number;
  created_at: string;
  approved_at: string;
  auction_id: number;
  user_id: string;
  username: string;
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
      const result = await sql`
        INSERT INTO bids (amount, created_at, auction_id, user_id, username)
        VALUES (${amount}, ${createdAt}, ${auctionId}, ${userId}, ${username})
        RETURNING *
      ` as Bid[];

      if (!result.length) throw new Error("Failed to insert bid");

      const newBid = result[0];

      const redisKey = `auction:${auctionId}:highest_bid`;
      io.to(`auction_${auctionId}`).emit("new-highest-bid", newBid);
      await redisClient.hSet(redisKey, {
        amount: amount.toString(),
        userId: userId,
        winningTime: createdAt.toISOString(),
        approvedAt: new Date().toISOString(),
      });

      console.log(`New highest bid for auction ${auctionId}: ${amount}`);
    } else {
      console.log(`Bid of ${amount} rejected — not higher than current highest`);
    }
  });
};