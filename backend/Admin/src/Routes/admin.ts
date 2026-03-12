import { Router } from "express";
import { createAuctionItem, updateAuctionItem, deleteAuctionItem, changeBanStatus } from "../controller/admin.js";
import uploadFile from "../config/multer.js";
import { isAuth } from "../middleware/isAuth.js";
const router=Router()
router.post("/create-auction",isAuth,uploadFile,createAuctionItem)
router.post("/change-ban-status",isAuth,changeBanStatus)

router.patch("/update-auction/:id",isAuth,uploadFile,updateAuctionItem)
router.delete("/delete-auction/:id",isAuth,uploadFile,deleteAuctionItem)

export default router