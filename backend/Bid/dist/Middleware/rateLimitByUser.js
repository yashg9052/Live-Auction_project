import { redisClient } from "../index.js";
import { getBidRateLimitUserKey } from "../utils/key.js";
export const rateLimitByUser = async (req, res, next) => {
    try {
        if (!req.user || !req.user.email) {
            res.status(401).json({
                message: "Unauthorized User",
            });
            return;
        }
        const userId = req.user.email;
        const hashKey = getBidRateLimitUserKey();
        const maxRequests = 5;
        const windowSeconds = 60;
        const currentCountStr = await redisClient.hGet(hashKey, userId);
        const currentCount = currentCountStr ? parseInt(currentCountStr, 10) + 1 : 1;
        // Set the new count in the hash
        await redisClient.hSet(hashKey, userId, currentCount.toString());
        // Set expiry on first request for this user
        if (currentCount === 1) {
            await redisClient.expireAt(hashKey, Math.floor(Date.now() / 1000) + windowSeconds);
        }
        if (currentCount > maxRequests) {
            res.status(429).json({
                message: `Rate limit exceeded. Maximum ${maxRequests} bids allowed per minute`,
            });
            return;
        }
        next();
    }
    catch (error) {
        console.log("Rate limit middleware error:", error);
        next();
    }
};
//# sourceMappingURL=rateLimitByUser.js.map