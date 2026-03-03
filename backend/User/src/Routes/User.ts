import { Router } from "express";
import { register, login, getProfile, ForgotPassword, verifyUser } from "../controller/user.js";
import { isAuth } from "../Middleware/isAuth.js";

const router = Router();
router.post("/user/register", register);
router.post("/user/login", login);
router.get("/user/profile", isAuth, getProfile);
router.post("/user/forgot-password", ForgotPassword);
router.post("/user/verify-user", verifyUser);
export default router;