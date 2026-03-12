import TryCatch from "../config/TryCatch.js";
import type { CookieOptions, Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, type IUser } from "../Model/UserModel.js";
import { generateToken } from "../config/GenerateToken.js";
import { publishToQueue } from "../config/rabbitMq.js";
import type { AuthenticatedRequest } from "../Middleware/isAuth.js";
import { redisClient } from "../index.js";
import {
  createSession,
  deleteSession,
  deleteSessionByUserId,
} from "../utils/sessionUtils.js";
import {
  getOtpDataKey,
  getOtpRateLimitKey,
  getUserListKey,
} from "../utils/key.js";
import { channel } from "diagnostics_channel";

const sendOtp = async (email: string): Promise<string> => {
  const otpRateLimitKey = getOtpRateLimitKey();
  const TrimmedEmail = email.trim();
  const rateLimitCheck = await redisClient.hGet(otpRateLimitKey, TrimmedEmail);

  if (rateLimitCheck) {
    return "Too many requests. Please wait before requesting a new OTP";
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpDataKey = getOtpDataKey();

  await redisClient.hSet(otpDataKey, email, otp);
  await redisClient.expireAt(otpDataKey, Math.floor(Date.now() / 1000) + 300);

  await redisClient.hSet(otpRateLimitKey, email, "true");
  await redisClient.expireAt(
    otpRateLimitKey,
    Math.floor(Date.now() / 1000) + 60,
  );

  const message = {
    to: email,
    subject: "Verify Your Email Address",
    body: `Welcome!

Thank you for registering with us.

To complete your account setup, please verify your email address using the One-Time Password (OTP) below:

Your Verification OTP: ${otp}

This OTP is valid for 5 minutes.

If you did not create this account, please ignore this email.

Welcome aboard!`,
  };

  await publishToQueue("auction-send-otp", message);

  return `OTP has been sent to ${email}`;
};

export const sendOtpForRegisteration = TryCatch(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const trimmedEmail = email.trim();

    const existingUser: IUser | null = await User.findOne({
      email: trimmedEmail,
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const message: string = await sendOtp(trimmedEmail);
    res.status(200).json({ message });
  },
);

export const verifyOtpForRegistration = TryCatch(
  async (req: Request, res: Response) => {
    const { email, otp: enteredOtp } = req.body;

    if (!email || !enteredOtp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpDataKey = getOtpDataKey();
    const storedOtp = await redisClient.hGet(otpDataKey, email.trim());

    if (!storedOtp || storedOtp !== enteredOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    await redisClient.hDel(otpDataKey, email.trim());
    return res.status(200).json({ message: "OTP verified successfully" });
  },
);

export const registerUser = TryCatch(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email: email.trim() });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: name,
    email: email.trim(),
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

    const userId = user._id.toString();
    const profileKey = "BidBase:user:profiles"

    const profileData = {
      _id: userId,
      email: user.email,
      username: user.username,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    
    if (redisClient.isReady) {
      const cached = await redisClient.hGet(profileKey, userId);
      if (cached) {
        console.log("Profile cache hit");
        return res.status(200).json({
          message: "Profile retrieved successfully",
          user: JSON.parse(cached),
        });
      }

      
      await redisClient.hSet(profileKey, userId, JSON.stringify(profileData));
      await redisClient.expire(profileKey, 120);
    }

    return res.status(200).json({
      message: "Profile retrieved successfully",
      user: profileData,
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
  await redisClient.expireAt(
    otpRateLimitKey,
    Math.floor(Date.now() / 1000) + 60,
  );

  const message = {
    to: email,
    subject: "Password Reset OTP - Secure Your Account",
    body: `Hello,

We received a request to reset the password for your account.

Your One-Time Password (OTP) is: ${otp}

This OTP is valid for the next 5 minutes. Please enter it on the password reset page to continue.

If you did not request a password reset, please ignore this message. Your account will remain secure.
`,
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

  const users: IUser[] = await User.find({ role: { $ne: "admin" } }).select(
    "-password",
  );
  
  res.status(200).json({
    message: "All users fetched successfully",
    Users: users,
  });
});



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
