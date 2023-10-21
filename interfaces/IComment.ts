import mongoose, { ObjectId } from "mongoose";
import { IUser } from "./IUser";
import { COMMENT_STATUS, IGroup } from "./IGroup";

export interface IComment {
  _id: string;
  app: string | ObjectId;
  group: string | ObjectId | IGroup;
  user?: string | ObjectId | IUser;
  anonUser?: Pick<IUser, "name" | "email" | "avatarBackgroundColor">;
  commentUser?: Pick<IUser, "name" | "email" | "avatarBackgroundColor">;
  parent: string | ObjectId;
  pageTitle: string;
  pageUrl: string;
  repliesCount: number;
  comment: string;
  status: `${COMMENT_STATUS}`;
  isSpam: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface ICommentDocument
  extends mongoose.Document,
    Omit<IComment, "_id"> {}
