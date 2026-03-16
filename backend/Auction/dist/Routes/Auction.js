import { Router } from "express";
import { isAuth } from "../Middleware/isAuth.js";
import { getAllAuctions, getSingleAuctionDetail, getActiveBids, getWonItems } from "../controllers/Auction.js";
const router = Router();
router.get("/all", getAllAuctions);
router.get("/auction/:id", getSingleAuctionDetail);
router.get("/active-bids", isAuth, getActiveBids);
router.get("/won-items", isAuth, getWonItems);
export default router;
//# sourceMappingURL=Auction.js.map