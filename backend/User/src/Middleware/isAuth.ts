import type { NextFunction, Request, Response } from "express";
import { User, type IUser } from "../Model/UserModel.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type mongoose from "mongoose";
export interface MUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  role: string;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface AuthenticatedRequest extends Request {
  user?: MUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.token as string;
    if (!token) {
      res.status(403).json({
        message: "Please Login",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!decoded || !decoded.userId) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({
        message: "User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Please login Jwt-error",
    });
  }
};
