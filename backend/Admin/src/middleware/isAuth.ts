import type { NextFunction, Request, Response } from "express";

import jwt, { type JwtPayload } from "jsonwebtoken";
import type mongoose from "mongoose";
export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  role:string;
  bids: mongoose.Types.ObjectId[];
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
    

    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }
    req.user = decodedValue.user;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Please login Jwt-error",
    });
  }
};
