import { Router } from "express";
import { isAuth } from "../Middleware/isAuth.js";
import { rateLimitByUser } from "../Middleware/rateLimitByUser.js";
import { rateLimitByIp } from "../Middleware/rateLimitByIp.js";
import { makeBid } from "../controller/Bid.js";
const router = Router();
// POST route for making a bid - protected route with rate limiting
// Rate limited by IP first, then by user, then authenticated
router.post("/bid/make", rateLimitByIp, isAuth, rateLimitByUser, makeBid);
export default router;
//# sourceMappingURL=Bid.js.map