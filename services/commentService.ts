import { CommentGif, isCommentGif } from "@/utils/gif";
import App from "@/models/App";
import Comment from "@/models/Comment";
import Group from "@/models/Group";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";
import { ICommentDocument } from "@/interfaces/IComment";
import factoryService from "./factoryService";
import _ from "lodash";
import { COMMENT_STATUS, IGroup, IGroupDocument } from "@/interfaces/IGroup";
import { AVATAR_BACKGROUND_COLORS } from "@/interfaces/IUser";

const getAllAppComments = async ({
  userId,
  appId,
  queryParams,
}: {
  userId: string;
  appId: string;
  queryParams: any;
}): Promise<[ICommentDocument[], number, number]> => {
  if (!appId)
    throw new AppError(
      "Missing app id (appId) parameter",
      StatusCodes.BAD_REQUEST
    );

  const app = await App.findOne({
    _id: appId,
    user: userId,
  }).lean();

  if (!app)
    throw new AppError(
      "App with that id not found or you're not authorized.",
      StatusCodes.BAD_REQUEST
    );

  return factoryService
    .find(Comment, {
      sort: "-createdAt",
      ...queryParams,
      app: appId,
      isSpam: false,
      fields:
        "_id, repliesCount, commentUser, app, anonUser, status, comment, gif, parent, pageTitle, pageUrl, createdAt",
    })
    .populate({ path: "user", select: "name image avatarBackgroundColor -_id" })
    .exec();
};

const createComment = async ({
  appCode,
  groupIdentifier,
  userId,
  pageTitle,
  pageUrl,
  comment,
  gif,
  parentCommentId,
  anonUser,
}: {
  appCode: string;
  groupIdentifier: string;
  userId?: string;
  pageTitle: string;
  pageUrl: string;
  comment: string;
  gif?: CommentGif;
  parentCommentId: string;
  anonUser?: {
    name: string;
    email: string;
  };
}) => {
  if (gif !== undefined && !isCommentGif(gif))
    throw new AppError("Invalid GIF attachment", StatusCodes.BAD_REQUEST);
  if (typeof comment !== "string" && comment !== undefined)
    throw new AppError("Invalid comment", StatusCodes.BAD_REQUEST);
  comment = (comment ?? "").trim();
  if (!comment && !gif)
    throw new AppError("Add a comment or choose a GIF", StatusCodes.BAD_REQUEST);
  if (!appCode || !groupIdentifier || !pageTitle || !pageUrl)
    throw new AppError(
      "Missing one or more fields app code (appCode), group identifier (identifier), page title (pageTitle), page url (pageUrl), comment",
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
      "Comments group with that identifier and app not found",
      StatusCodes.BAD_REQUEST
    );

  let userComment;
  if (userId) {
    userComment = new Comment({
      app: app._id,
      group: group._id,
      parent: parentCommentId,
      user: userId,
      pageTitle,
      pageUrl,
      comment,
      gif,
      status: COMMENT_STATUS.approved,
    });
  } else {
    userComment = new Comment({
      app: app._id,
      group: group._id,
      parent: parentCommentId,
      anonUser: {
        name: anonUser?.name,
        email: anonUser?.email,
        avatarBackgroundColor:
          AVATAR_BACKGROUND_COLORS[
            Math.floor(
              (anonUser?.email.length ?? 0) % AVATAR_BACKGROUND_COLORS.length
            )
          ] || "#fed0bb",
      },
      pageTitle,
      pageUrl,
      comment,
      gif,
      status: COMMENT_STATUS.approved,
    });
  }

  await userComment.validate();

  increaseGroupAndParentCommentsCount({ group, parentCommentId });

  return userComment.save();
};

const updateCommentStatus = async ({
  commentId,
  userId,
  status,
}: {
  commentId: string;
  userId: string;
  status: `${COMMENT_STATUS}`;
}) => {
  if (status !== COMMENT_STATUS.approved && status !== COMMENT_STATUS.deleted)
    throw new AppError(
      "Invalid comment status provided",
      StatusCodes.BAD_REQUEST
    );

  const comment = await Comment.findById(commentId).populate("group");
  if (!comment)
    throw new AppError(
      "Comment with that id not found",
      StatusCodes.BAD_REQUEST
    );

  if (
    userId !== (comment.group as IGroup)?.owner.toString() &&
    userId !== comment.user?.toString()
  )
    throw new AppError(
      "You are not authorized to perform this action",
      StatusCodes.FORBIDDEN
    );

  if (comment.status === status)
    throw new AppError(
      `Comment alreay has ${status} status`,
      StatusCodes.BAD_REQUEST
    );

  if (
    userId === comment.user?.toString() &&
    userId !== (comment.group as IGroup)?.owner.toString() &&
    status !== COMMENT_STATUS.deleted
  )
    throw new AppError(
      "You are not authorized to perform this action",
      StatusCodes.FORBIDDEN
    );

  if (comment.status === COMMENT_STATUS.deleted)
    throw new AppError(
      "You cannot update deleted comment's status",
      StatusCodes.BAD_REQUEST
    );

  if (status === COMMENT_STATUS.deleted) return removeComment(comment);

  comment.status = status;

  const group = await Group.findById((comment.group as IGroup)._id);

  increaseGroupAndParentCommentsCount({
    group,
    parentCommentId: comment.parent as string,
  });

  return comment.save();
};

const markCommentAsSpam = async ({
  commentId,
  userId,
}: {
  commentId: string;
  userId: string;
}) => {
  const comment = await Comment.findById(commentId).populate("group");
  if (!comment)
    throw new AppError(
      "Comment with that id not found",
      StatusCodes.BAD_REQUEST
    );

  if (
    userId !== (comment.group as IGroup)?.owner.toString() &&
    userId !== comment.user?.toString()
  )
    throw new AppError(
      "You are not authorized to perform this action",
      StatusCodes.FORBIDDEN
    );

  if (!comment)
    throw new AppError(
      "Comment with that id not found or you're not authorized.",
      StatusCodes.BAD_REQUEST
    );
  if (comment.isSpam)
    throw new AppError(
      "Comment is already marked as spam",
      StatusCodes.BAD_REQUEST
    );

  await decreaseGroupAndParentCommentCount(comment);

  comment.isSpam = true;
  return comment.save();
};

const updateOwnComment = async (commentId: string, userId: string, data: { comment?: unknown; gif?: unknown }) => {
  const comment = await Comment.findOne({ _id: commentId, user: userId, status: COMMENT_STATUS.approved, isSpam: false });
  if (!comment) throw new AppError("Comment not found or you cannot edit it", StatusCodes.FORBIDDEN);
  if (typeof data.comment !== "string" || (!data.comment.trim() && !data.gif))
    throw new AppError("Add a comment or choose a GIF", StatusCodes.BAD_REQUEST);
  if (data.gif != null && !isCommentGif(data.gif))
    throw new AppError("Invalid GIF attachment", StatusCodes.BAD_REQUEST);
  comment.comment = data.comment.trim();
  comment.gif = data.gif == null ? undefined : data.gif as CommentGif;
  return comment.save();
};

const deleteOwnComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findOne({ _id: commentId, user: userId, status: COMMENT_STATUS.approved, isSpam: false });
  if (!comment) throw new AppError("Comment not found or you cannot delete it", StatusCodes.FORBIDDEN);
  return removeComment(comment);
};

export default {
  updateOwnComment,
  deleteOwnComment,
  createComment,
  updateCommentStatus,
  markCommentAsSpam,
  getAllAppComments,
};

const increaseGroupAndParentCommentsCount = ({
  group,
  parentCommentId,
}: {
  group: IGroupDocument | null;
  parentCommentId: string | null;
}) => {
  if (!group)
    throw new AppError(
      "Group cannot be null to update comment count",
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
};
const removeComment = async (
  userComment: ICommentDocument | null
): Promise<ICommentDocument> => {
  if (!userComment)
    throw new AppError(
      "Comment with that id not found or user doesn't have sufficient permission for this action.",
      StatusCodes.BAD_REQUEST
    );

  if (userComment.status === COMMENT_STATUS.deleted)
    throw new AppError("Comment is already deleted", StatusCodes.BAD_REQUEST);

  await decreaseGroupAndParentCommentCount(userComment);

  userComment.status = COMMENT_STATUS.deleted;
  return userComment.save();
};

const decreaseGroupAndParentCommentCount = async (comment: ICommentDocument) => {
  if (comment.status !== COMMENT_STATUS.approved || comment.isSpam) return;
  let count = 1;
  if (comment.parent) {
    await Comment.updateOne({ _id: comment.parent, repliesCount: { $gt: 0 } }, { $inc: { repliesCount: -1 } });
  } else {
    const replies = await Comment.updateMany(
      { parent: comment._id, status: COMMENT_STATUS.approved, isSpam: false },
      { $set: { status: COMMENT_STATUS.deleted } }
    );
    count += replies.modifiedCount;
  }
  await Group.updateOne({ _id: comment.group }, { $inc: { commentsCount: -count } });
};
