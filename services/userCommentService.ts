import App from "@/models/App";
import Comment from "@/models/Comment";
import Group from "@/models/Collection";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";

const createComment = async ({
  appCode,
  groupIdentifier,
  userId,
  comment,
  parentCommentId,
}: {
  appCode: string;
  groupIdentifier: string;
  userId: string;
  comment: string;
  parentCommentId: string;
}) => {
  if (!appCode || !groupIdentifier || !userId || !comment)
    throw new AppError(
      "Missing app code (appCode) or group identifier (identifier) or comment or user id",
      StatusCodes.BAD_REQUEST
    );

  const app = await App.findOne({ code: appCode });

  if (!app)
    throw new AppError("App with that code not found", StatusCodes.BAD_REQUEST);

  let group = await Group.findOne({
    app: app._id,
    identifier: groupIdentifier,
  });

  if (!group)
    throw new AppError(
      "Comments group with that identifier and app id not found",
      StatusCodes.BAD_REQUEST
    );

  group.commentsCount = group.commentsCount + 1;
  group.save();

  if (parentCommentId) {
    Comment.findById(parentCommentId).then((parentComment): void => {
      if (parentComment) {
        parentComment.repliesCount = parentComment.repliesCount + 1;
        parentComment.save();
      }
    });
  }

  const userComment = await Comment.create({
    group: group._id,
    parent: parentCommentId,
    user: userId,
    comment,
  });

  return userComment;
};

const removeComment = async ({
  commentId,
  userId,
}: {
  commentId: string;
  userId: string;
}) => {
  if (!commentId || !userId)
    throw new AppError(
      "Missing comment id (commentId) or user id",
      StatusCodes.BAD_REQUEST
    );

  let userComment = await Comment.findOne({ _id: commentId, user: userId });

  if (!userComment)
    throw new AppError(
      "Comment with that id not found or doesn't belongs to current user",
      StatusCodes.BAD_REQUEST
    );

  if (userComment.isRemoved)
    throw new AppError("Comment is already removed", StatusCodes.BAD_REQUEST);

  Group.findById(userComment.group).then((group) => {
    if (group) {
      group.commentsCount = group.commentsCount - 1;
      group.save();
    }
  });

  if (userComment.parent) {
    Comment.findById(userComment.parent).then((parentComment) => {
      if (parentComment) {
        parentComment.repliesCount = parentComment.repliesCount - 1;
        parentComment.save();
      }
    });
  }

  userComment.isRemoved = true;
  userComment.save();
};

export default { createComment, removeComment };
