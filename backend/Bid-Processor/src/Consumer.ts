import { redisClient } from "./index.js";
import { sql } from "./config/db.js";
import { consumeFromQueue } from "./config/rabbitMq.js";

export const processBids = async () => {
  await consumeFromQueue("bid_queue", async (bid) => {
    console.log("Processing bid...");

    const { userId, auctionId, amount, bidTime } = bid;
    console.log(userId, auctionId, amount, bidTime)

    if (!auctionId || !amount || !userId) {
      console.log("Invalid bid data:", bid);
      return;
    }

    const createdAt = bidTime ? new Date(bidTime) : new Date();

    
    await sql`
      INSERT INTO bids (amount, created_at, auction_id, user_id)
      VALUES (${amount}, ${createdAt}, ${auctionId}, ${userId})
    `;

    // change highest bid based on amount and bidtime if req
    const updatedAuction = await sql`
      UPDATE auction_items
      SET 
        current_highest_bid = ${amount},
        current_highest_bidder_id = ${userId},
        current_highest_bid_time = ${createdAt},
        updated_at = NOW()
      WHERE id = ${auctionId}
        AND (
          ${amount} > current_highest_bid
          OR (
            ${amount} = current_highest_bid
            AND ${createdAt} < current_highest_bid_time
          )
        )
      RETURNING current_highest_bid,
                current_highest_bidder_id,
                current_highest_bid_time;
    `;

    // Update Redis if winner changed
    if (updatedAuction.length > 0) {
      const redisKey = `auction:${auctionId}:highest_bid`;

      await redisClient.hSet(redisKey, {
        amount: amount.toString(),
        userId: userId,
        winningTime: createdAt.toISOString(),
        approvedAt: new Date().toISOString(),
      });

      console.log(`New highest bid for auction ${auctionId}: ${amount}`);
    }
  });
};