import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../Middleware/isAuth.js";
import { publishToQueue } from "../config/rabbitMq.js";

export interface IAcceptingBid {
  auctionId: string;
  amount: number;
  
}
export const makeBid = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized User please login first",
    });
  }

  const { auctionId, amount }: IAcceptingBid = req.body;

  if (!auctionId || !amount) {
    return res.status(400).json({
      message: "auctionId and amount are required",
    });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      message: "Invalid bid amount",
    });
  }
  
  try {
    const bidMessage = {
      userId: req.user?._id,
      auctionId,
      amount,
      bidTime: new Date(),
      
    };

    await publishToQueue("bid_queue", bidMessage);

    return res.status(200).json({
      message: "Bid accepted and sent for processing",
      data: bidMessage,
    });
  } catch (error) {
    console.log("Error in approveBid:", error);
    return res.status(500).json({
      message: "Error processing bids",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
