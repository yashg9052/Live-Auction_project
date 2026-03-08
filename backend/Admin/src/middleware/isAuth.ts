import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import type { NextFunction, Request, Response } from "express";
export interface IUser extends Document {
  _id:mongoose.Types.ObjectId
  email: string;
  username: string;
  role: string;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
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
    const { data } = await axios.get(
      `${process.env.User_URL as string}/api/v1/user/profile`,
      {
        headers: {
          token,
        },
      },
    );
    if (!data || !data.user) {
      res.status(400).json({
        message: "Unable to fetch user details",
      });
      return;
    }

    req.user = data.user;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Please login Jwt-error",
    });
  }
};
