import mongoose, { ObjectId } from "mongoose";
import { IUser } from "./IUser";

export interface IComment {
  _id: string;
  app: string | ObjectId;
  group: string | ObjectId;
  user: string | ObjectId | IUser;
  parent: string | ObjectId;
  pageTitle: string;
  pageUrl: string;
  repliesCount: number;
  comment: string;
  isApproved: boolean;
  isRemoved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface ICommentDocument
  extends mongoose.Document,
    Omit<IComment, "_id"> {}
