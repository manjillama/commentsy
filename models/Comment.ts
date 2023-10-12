import { Schema } from "mongoose";
import createModel from "@/lib/createModel";
import { ICommentDocument } from "@/interfaces/IComment";

const commentSchema = new Schema<ICommentDocument>(
  {
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
    isRemoved: {
      type: Boolean,
      default: false,
      required: [true, "Comment is removed value is missing (isRemoved)"],
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
