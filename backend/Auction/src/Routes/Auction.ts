import { Router } from "express";
import { isAuth } from "../Middleware/isAuth.js";
import { getAllAuctions, getSingleAuctionDetail } from "../controllers/Auction.js";

const router = Router();
router.get("/all", getAllAuctions);
router.get("/auction/:id", getSingleAuctionDetail);

export default router;