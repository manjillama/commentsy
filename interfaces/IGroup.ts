import mongoose, { ObjectId } from "mongoose";

export enum COMMENT_STATUS {
  pending = "pending",
  approved = "approved",
  deleted = "deleted",
}
export interface IGroup {
  _id: string;
  identifier: string;
  app: string | ObjectId;
  owner: string | ObjectId;
  commentsCount: number;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface IGroupDocument
  extends mongoose.Document,
    Omit<IGroup, "_id"> {}
