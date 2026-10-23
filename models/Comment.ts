import { Schema } from "mongoose";
import createModel from "@/lib/createModel";
import { ICommentDocument } from "@/interfaces/IComment";
import { COMMENT_STATUS } from "@/interfaces/IGroup";
import { AVATAR_BACKGROUND_COLORS } from "@/interfaces/IUser";

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
    },
    anonUser: new Schema({
      name: {
        type: String,
        required: [true, "Missing anonymous user name (anonUser.name)"],
      },
      email: {
        type: String,
        required: [true, "Missing anonymous user email"],
        lowercase: true,
        trim: true,
        maxlength: 320,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email address",
        ],
      },
      avatarBackgroundColor: {
        type: String,
        enum: {
          values: AVATAR_BACKGROUND_COLORS,
          message: "{VALUE} is not supported",
        },
        required: [
          true,
          "Missing anonymous user avatar background color (anonUser.avatarBackgroundColor)",
        ],
      },
    }),
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
    isSpam: {
      type: Boolean,
      default: false,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);
commentSchema.virtual("commentUser").get(function () {
  return this.user ?? this.anonUser;
});
const Comment = createModel<ICommentDocument>("Comment", commentSchema);

export default Comment;
