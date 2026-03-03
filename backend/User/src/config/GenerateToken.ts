import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET=process.env.JWT_SECRET as string

export const generateToken=(userId:string)=>{
    return jwt.sign({userId:userId},JWT_SECRET,{expiresIn:"7d"})
}