import { Router } from "express";
import {
  register,
  login,
  getProfile,
  ForgotPassword,
  verifyUser,
  changeBanStatus,
  getAllUser,
  logout,
} from "../controller/user.js";
import { isAuth } from "../Middleware/isAuth.js";

const router = Router();
router.post("/user/register", register);
router.post("/user/login", login);
router.get("/user/profile", isAuth, getProfile);
router.post("/user/forgot-password", ForgotPassword);
router.post("/user/verify-user", verifyUser);
router.post("/user/logout", isAuth, logout);
router.patch("/admin/change-ban-status", isAuth, changeBanStatus);
router.get("/admin/users", isAuth, getAllUser);

export default router;
