import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
export const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            res.status(403).json({
                message: "Please Login",
            });
            return;
        }
        const { data } = await axios.get(`${process.env.User_URL}/api/v1/user/profile`, {
            headers: {
                token,
            },
        });
        if (!data || !data.user) {
            res.status(400).json({
                message: "Unable to fetch user details",
            });
            return;
        }
        req.user = data.user;
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Please login Jwt-error",
        });
    }
};
//# sourceMappingURL=isAuth.js.map