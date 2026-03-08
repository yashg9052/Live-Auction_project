import { Session } from "../Model/SessionModel.js";
import crypto from "crypto";
import mongoose from "mongoose";

export const createSession = async (userId: string) => {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const session = await Session.create({
    userId: new mongoose.Types.ObjectId(userId),
    sessionToken,
    expiresAt,
  });

  return session;
};

export const deleteSession = async (sessionToken: string) => {
    return await Session.findOneAndDelete({ sessionToken });
};

export const deleteSessionByUserId = async (userId: string) => {
  return await Session.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
};

export const validateSession = async (sessionToken: string) => {
    
  const session = await Session.findOne({
    sessionToken,
    expiresAt: { $gt: new Date() },
  });

  return session;
};
