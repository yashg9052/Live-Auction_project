import mongoose from "mongoose";
import type { NextFunction, Request, Response } from "express";
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
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
export declare const isAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=isAuth.d.ts.map