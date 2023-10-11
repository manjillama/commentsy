import mongoose, { ObjectId } from "mongoose";

export interface IApp extends mongoose.Document {
  name: string;
  code: string;
  userId: string | ObjectId;
  description: string;
  likes: number;
  authorizedOrigins: Array<string>;
  commentStyles: string;
  createdAt: Date;
  updatedAt: Date;
}
