import { Schema } from "mongoose";
import createModel from "@/lib/createModel";
import { ICommentDocument } from "@/interfaces/IComment";
import { COMMENT_STATUS } from "@/interfaces/IGroup";

const commentSchema = new Schema<ICommentDocument>(
  {
    app: {
      type: Schema.Types.ObjectId,
      ref: "App",
      required: [true, "Missing app id (app)"],
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "Missing group id (group)"],
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Missing user id (user)"],
    },
    pageTitle: {
      type: String,
      required: [true, "Missing page title"],
    },
    pageUrl: {
      type: String,
      required: [true, "Missing page url"],
      validate: {
        validator: function (url: string) {
          return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(
            url
          );
        },
        message: () =>
          `Invalid origin: URIs is required and must not contain a path or end with "/".`,
      },
    },
    repliesCount: {
      type: Number,
      default: 0,
      required: [true, "Missing replies count (repliesCount)"],
    },
    comment: {
      type: String,
      maxLength: 5000,
      required: [true, "Missing comment"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(COMMENT_STATUS),
        message: "{VALUE} is not supported",
      },
      default: COMMENT_STATUS.pending,
      required: [true, "Comment status is missing (status)"],
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

const Comment = createModel<ICommentDocument>("Comment", commentSchema);

export default Comment;
