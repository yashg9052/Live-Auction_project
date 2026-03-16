import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./isAuth.js";
export declare const rateLimitByUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rateLimitByUser.d.ts.map