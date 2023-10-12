import mongoose, { ObjectId } from "mongoose";

export interface IComment {
  _id: string;
  group: string | ObjectId;
  user: string | ObjectId;
  parent: string | ObjectId;
  repliesCount: number;
  comment: string;
  isRemoved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface ICommentDocument
  extends mongoose.Document,
    Omit<IComment, "_id"> {}
