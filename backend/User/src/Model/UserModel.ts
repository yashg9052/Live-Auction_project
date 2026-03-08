import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id:mongoose.Types.ObjectId
  email: string;
  password: string;
  username: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  banned:boolean;
}
const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
    },
    role:{
      type:String,
      enum:["admin","user"],
      default:"user"
    },
    password: {
      type: String,
      required: true,
    },
    banned:{
      type:Boolean,
      default:false
    }
  },
  {
    timestamps: true,
  },
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
