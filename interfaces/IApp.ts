import mongoose, { ObjectId } from "mongoose";
import { IUser } from "./IUser";

export type CommentStyles = {
  light: {
    primary: {
      backgroundColor: string;
      color: string;
    };
    accent: {
      backgroundColor: string;
      color: string;
    };
  };
  dark: {
    primary: {
      backgroundColor: string;
      color: string;
    };
    accent: {
      backgroundColor: string;
      color: string;
    };
  };
};
export interface IApp {
  _id: string;
  name: string;
  code: string;
  user: string | ObjectId | IUser;
  description: string;
  authorizedOrigins: Array<string>;
  commentStyles: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IAppDocument extends mongoose.Document, Omit<IApp, "_id"> {}
