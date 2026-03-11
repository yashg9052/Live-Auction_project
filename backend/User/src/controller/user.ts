import TryCatch from "../config/TryCatch.js";
import type { CookieOptions, Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, type IUser } from "../Model/UserModel.js";
import { Session } from "../Model/SessionModel.js";
import { generateToken } from "../config/GenerateToken.js";
import { publishToQueue } from "../config/rabbitMq.js";
import type { AuthenticatedRequest } from "../Middleware/isAuth.js";
import { redisClient } from "../index.js";
import { createSession, deleteSession, deleteSessionByUserId } from "../utils/sessionUtils.js";
import { getOtpDataKey, getOtpRateLimitKey, getUserListKey } from "../utils/key.js";

interface GoogleClaims {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}
export const register = TryCatch(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, password and username are required" });
  }

  const existingUser: IUser | null = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user._id);
  await createSession(user._id.toString());

  return res.status(201).json({
    message: "User created successfully",
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  });
});

export const login = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user: IUser | null = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  await createSession(user._id.toString());
  const token = generateToken(user._id.toString());

  return res.status(200).json({
    message: "Logged in successfully",
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  });
});

export const getProfile = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile retrieved successfully",
      user: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        banned: user.banned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  },
);

export const ForgotPassword = TryCatch(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user: IUser | null = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message: `There is no account registered with the email : ${email}`,
    });
  }

  const otpRateLimitKey = getOtpRateLimitKey();
  const rateLimitCheck = await redisClient.hGet(otpRateLimitKey, email);

  if (rateLimitCheck) {
    return res.status(429).json({
      message: "Too many requests. Please wait before requesting a new OTP",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpDataKey = getOtpDataKey();

  await redisClient.hSet(otpDataKey, email, otp);
  await redisClient.expireAt(otpDataKey, Math.floor(Date.now() / 1000) + 300);

  await redisClient.hSet(otpRateLimitKey, email, "true");
  await redisClient.expireAt(otpRateLimitKey, Math.floor(Date.now() / 1000) + 60);

  const message = {
    to: email,
    subject: "Your OTP Code",
    body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  await publishToQueue("auction-send-otp", message);

  return res.status(200).json({
    message: `OTP has been sent to ${email}`,
  });
});

export const verifyUser = TryCatch(async (req: Request, res: Response) => {
  const { email, otp: enteredOtp } = req.body;

  if (!email || !enteredOtp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const otpDataKey = getOtpDataKey();
  const storedOtp = await redisClient.hGet(otpDataKey, email);

  if (!storedOtp || storedOtp !== enteredOtp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await redisClient.hDel(otpDataKey, email);

  const user: IUser | null = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await createSession(user._id.toString());
  const token = generateToken(user._id.toString());

  return res.status(200).json({
    message: "User verified successfully",
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  });
});
export const getAllUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user || req.user?.role !== "admin") {
    return res.status(401).json({
      message: "Unauthorized. Only admins can unban users",
    });
  }
  const Users_key = getUserListKey();
  if (redisClient.isReady) {
    const cached = await redisClient.hGetAll(Users_key);
    if (Object.keys(cached).length > 0) {
      console.log("cache hit");
      const users: IUser[] = Object.values(cached).map((u) => JSON.parse(u));
      return res.status(200).json({
        message: "Users fetched from cache",
        users,
      });
    }
  }
  const users: IUser[] = await User.find({ role: { $ne: "admin" } }).select(
    "-password",
  );
  if (redisClient.isReady && users.length > 0) {
    const hashData: Record<string, string> = {};

    users.forEach((user) => {
      hashData[user._id.toString()] = JSON.stringify(user);
    });

    await redisClient.hSet(Users_key, hashData);
    await redisClient.expire(Users_key, 60);
  }
  res.status(200).json({
    message: "All users fetched successfully",
    Users: users,
  });
});

export const changeBanStatus = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const adminUser = req.user;

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(401).json({
        message: "Unauthorized. Only admins can change user ban status",
      });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.banned = !user.banned;
    await user.save();

    return res.status(200).json({
      message: `User ${user.banned ? "banned" : "unbanned"} successfully`,
      user: {
        _id: user._id,
        banned: user.banned,
        updatedAt: user.updatedAt,
      },
    });
  },
);

export const logout = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await deleteSessionByUserId(user._id.toString());

    return res.status(200).json({
      message: "Logged out successfully",
    });
  },
);

