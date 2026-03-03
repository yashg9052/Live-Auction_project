import TryCatch from "../config/TryCatch.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, type IUser } from "../Model/UserModel.js";
import { generateToken } from "../config/GenerateToken.js";
import { publishToQueue } from "../config/rabbitMq.js";
import type { AuthenticatedRequest } from "../Middleware/isAuth.js";
import { redisClient } from "../index.js";

export const register = TryCatch(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, password and username are required" });
  }

  const existingUser :IUser|null= await User.findOne({ email });
  
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

  return res.status(201).json({
    message: "User created successfully",
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
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

  const user :IUser|null= await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id.toString());

  return res.status(200).json({
    message: "Logged in successfully",
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  });
});

export const getProfile = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user= req.user;

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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }
);

export const ForgotPassword = TryCatch(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user :IUser |null= await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json({ message: `There is no account registered with the email : ${email}` });
  }

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    return res.status(429).json({
      message: "Too many requests. Please wait before requesting a new OTP",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, otp, { EX: 300 });
  await redisClient.set(rateLimitKey, "true", { EX: 60 });

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

  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp || storedOtp !== enteredOtp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await redisClient.del(otpKey);

  const user:IUser|null = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = generateToken(user._id.toString());

  return res.status(200).json({
    message: "User verified successfully",
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  });
});