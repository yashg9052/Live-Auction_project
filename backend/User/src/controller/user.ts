import TryCatch from "../config/TryCatch.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../Model/UserModel.js";
import { generateToken } from "../config/GenerateToken.js";

// Register Controller
export const register = TryCatch(async (req: Request, res: Response) => {
    
  const {email, password, username } = req.body;

  // Validate input
  if (!email || !password || !username) {
    return res.status(400).json({
      message: "Email, password, and username are required",
    });
  }
//   function isValidPassword(password: string): boolean {
//     return password.length >= 10;
//   }
//   if (isValidPassword(password) === false) {
//     return res.status(400).json({
//       message: "Password must be atleast 10 characters long",
//     });
//   }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      message: "User with this email already exists",
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = new User({
    email,
    username,
    password: hashedPassword,
  });

  await newUser.save();

  // Generate token
  const token = generateToken(newUser);

  return res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
    },
  });
});

// Login Controller
export const login = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // Generate token
  const token = generateToken(user);

  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
    },
  });
});
