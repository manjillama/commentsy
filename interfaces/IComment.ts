import mongoose, { ObjectId } from "mongoose";
import { IUser } from "./IUser";
import { COMMENT_STATUS } from "./IGroup";

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
  status: `${COMMENT_STATUS}`;
  createdAt: Date;
  updatedAt: Date;
}
export interface ICommentDocument
  extends mongoose.Document,
    Omit<IComment, "_id"> {}
