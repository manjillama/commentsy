import mongoose, { ObjectId } from "mongoose";

export interface IApp {
  _id: string;
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
export interface IAppDocument extends mongoose.Document, Omit<IApp, "_id"> {}
