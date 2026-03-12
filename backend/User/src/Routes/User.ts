import { Router } from "express";
import {
  sendOtpForRegisteration,
  verifyOtpForRegistration,
  registerUser,
  login,
  getProfile,
  ForgotPassword,
  verifyUser,
  
  getAllUser,
  logout,
 
} from "../controller/user.js";
import { isAuth } from "../Middleware/isAuth.js";

const router = Router();
router.post("/user/register/send-otp",sendOtpForRegisteration );
router.post("/user/register/verify-otp",verifyOtpForRegistration );
router.post("/user/register",registerUser);
router.post("/user/login", login);
router.get("/user/profile", isAuth, getProfile);

router.post("/user/forgot-password", ForgotPassword);
router.post("/user/verify-user", verifyUser);
router.post("/user/logout", isAuth, logout);

router.get("/admin/users", isAuth, getAllUser);

export default router;
