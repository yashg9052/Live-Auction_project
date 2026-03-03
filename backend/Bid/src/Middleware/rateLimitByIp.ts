import type { NextFunction, Response, Request } from "express";
import { redisClient } from "../index.js";

export const rateLimitByIp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const clientIp =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "unknown";
    const key = `bid_rate_limit_ip:${clientIp}`;
    const maxRequests = 5;
    const windowSeconds = 60;

    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    if (currentCount > maxRequests) {
      res.status(429).json({
        message: `Rate limit exceeded for your IP. Maximum ${maxRequests} bids allowed per minute`,
      });
      return;
    }

    next();
  } catch (error) {
    console.log("IP Rate limit middleware error:", error);
    next();
  }
};
