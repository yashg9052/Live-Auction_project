import { redisClient } from "../index.js";
import { getBidRateLimitIpKey } from "../utils/key.js";
export const rateLimitByIp = async (req, res, next) => {
    try {
        const clientIp = req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            "unknown";
        const hashKey = getBidRateLimitIpKey();
        const maxRequests = 5;
        const windowSeconds = 60;
        const currentCountStr = await redisClient.hGet(hashKey, clientIp);
        const currentCount = currentCountStr ? parseInt(currentCountStr, 10) + 1 : 1;
        // Set the new count in the hash
        await redisClient.hSet(hashKey, clientIp, currentCount.toString());
        // Set expiry on first request for this IP
        if (currentCount === 1) {
            await redisClient.expireAt(hashKey, Math.floor(Date.now() / 1000) + windowSeconds);
        }
        if (currentCount > maxRequests) {
            res.status(429).json({
                message: `Rate limit exceeded for your IP. Maximum ${maxRequests} bids allowed per minute`,
            });
            return;
        }
        next();
    }
    catch (error) {
        console.log("IP Rate limit middleware error:", error);
        next();
    }
};
//# sourceMappingURL=rateLimitByIp.js.map