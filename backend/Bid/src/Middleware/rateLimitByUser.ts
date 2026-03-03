import type { NextFunction, Response } from "express";
import { redisClient } from "../index.js";
import type { AuthenticatedRequest } from "./isAuth.js";

export const rateLimitByUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || !req.user.email) {
      res.status(401).json({
        message: "Unauthorized User",
      });
      return;
    }

    const userId = req.user.email;
    const key = `bid_rate_limit_user:${userId}`;
    const maxRequests = 5;
    const windowSeconds = 60;

    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    if (currentCount > maxRequests) {
      res.status(429).json({
        message: `Rate limit exceeded. Maximum ${maxRequests} bids allowed per minute`,
      });
      return;
    }

    next();
  } catch (error) {
    console.log("Rate limit middleware error:", error);
    next();
  }
};
