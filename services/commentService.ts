import logger from "@/utils/logger";
import mongoose, { ClientSession } from "mongoose";
import { isAuthorizedPage } from "@/utils/origin";
import { normalizePageUrl } from "@/utils/pageUrl";
import { CommentGif, isCommentGif } from "@/utils/gif";
import App from "@/models/App";
import Comment from "@/models/Comment";
import Group from "@/models/Group";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";
import { ICommentDocument } from "@/interfaces/IComment";
import factoryService from "./factoryService";
import _ from "lodash";
import { COMMENT_STATUS, IGroup } from "@/interfaces/IGroup";
import { AVATAR_BACKGROUND_COLORS } from "@/interfaces/IUser";

async function commentTransaction(operation: string, work: (session: ClientSession) => Promise<ICommentDocument>): Promise<ICommentDocument> {
  let result!: ICommentDocument;
  let attempts = 0;
  const started = Date.now();
  try {
    await mongoose.connection.transaction(async session => {
      attempts++;
      result = await work(session);
    });
  } catch (error: any) {
    // The API boundary emits the failure once, including the business operation.
    if (error instanceof Error) Object.assign(error, { operation });
    throw error;
  }
  // Emit only after commit: retries and rollbacks must not create false events.
  const fields = { commentId: result._id?.toString(), status: result.status, reply: Boolean(result.parent) };
  if (operation === "comment.created" || operation === "comment.edited") logger.debug(operation, fields);
  else logger.info(operation, fields);
  if (attempts > 1) logger.warn("comment.transaction.retried", { ...fields, operation, attempts, elapsedMs: Date.now() - started });
  return result;
}

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
        "_id, repliesCount, commentUser, app, anonUser, status, comment, gif, editedAt, parent, pageTitle, pageUrl, createdAt",
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
}) => commentTransaction("comment.created", async session => {
  if (gif !== undefined && !isCommentGif(gif))
    throw new AppError("Invalid GIF attachment", StatusCodes.BAD_REQUEST);
  if (typeof comment !== "string" && comment !== undefined)
    throw new AppError("Invalid comment", StatusCodes.BAD_REQUEST);
  comment = (comment ?? "").trim();
  if (!comment && !gif)
    throw new AppError("Add a comment or choose a GIF", StatusCodes.BAD_REQUEST);
  if (typeof appCode !== "string" || !appCode || appCode.length > 100 ||
      typeof groupIdentifier !== "string" || !groupIdentifier.trim() || groupIdentifier.length > 500 ||
      typeof pageTitle !== "string" || !pageTitle.trim() || pageTitle.length > 1000 ||
      typeof pageUrl !== "string" || !pageUrl ||
      (parentCommentId != null && typeof parentCommentId !== "string"))
    throw new AppError(
      "Missing one or more fields app code (appCode), group identifier (identifier), page title (pageTitle), page url (pageUrl), comment",
      StatusCodes.BAD_REQUEST
    );

  const normalizedPageUrl = normalizePageUrl(pageUrl);
  if (!normalizedPageUrl) throw new AppError("Enter a valid absolute HTTP or HTTPS page URL", StatusCodes.BAD_REQUEST);
  pageUrl = normalizedPageUrl;

  const app = await App.findOne({ code: appCode }, null, { session });

  if (!app)
    throw new AppError("App with that code not found", StatusCodes.BAD_REQUEST);

  if (!isAuthorizedPage(app.authorizedOrigins, pageUrl))
    throw new AppError("Page URL is not on an authorized site origin", StatusCodes.FORBIDDEN);

  const group = await Group.findOne({
    app: app._id,
    identifier: groupIdentifier,
  }, null, { session });

  if (!group)
    throw new AppError(
      "Comments group with that identifier and app not found",
      StatusCodes.BAD_REQUEST
    );

  if (parentCommentId) {
    const parent = await Comment.findById(parentCommentId, null, { session });
    if (!parent || parent.parent || parent.status !== COMMENT_STATUS.approved || parent.isSpam ||
        String(parent.app) !== String(app._id) || String(parent.group) !== String(group._id))
      throw new AppError("Replies are closed for this comment", StatusCodes.BAD_REQUEST);
  }

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
              (anonUser?.email?.length ?? 0) % AVATAR_BACKGROUND_COLORS.length
            )
          ] || "#fed0bb",
      },
      pageTitle,
      pageUrl,
      comment,
      gif,
      status: app.requireGuestApproval ? COMMENT_STATUS.pending : COMMENT_STATUS.approved,
    });
  }

  await userComment.validate();

  await userComment.save({ session });
  if (userComment.status === COMMENT_STATUS.approved)
    await changeCommentCounts(userComment, 1, session);
  return userComment;
});

const updateCommentStatus = async ({
  commentId,
  userId,
  status,
}: {
  commentId: string;
  userId: string;
  status: `${COMMENT_STATUS}`;
}) => commentTransaction("comment.moderated", async session => {
  if (status !== COMMENT_STATUS.approved && status !== COMMENT_STATUS.deleted)
    throw new AppError(
      "Invalid comment status provided",
      StatusCodes.BAD_REQUEST
    );

  const comment = await Comment.findById(commentId, null, { session }).populate("group");
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
      `Comment already has ${status} status`,
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

  if (status === COMMENT_STATUS.deleted) return removeComment(comment, session);

  comment.status = status;

  await comment.save({ session });
  if (!comment.isSpam) await changeCommentCounts(comment, 1, session);
  return comment;
});

const markCommentAsSpam = async ({
  commentId,
  userId,
}: {
  commentId: string;
  userId: string;
}) => commentTransaction("comment.marked_spam", async session => {
  const comment = await Comment.findById(commentId, null, { session }).populate("group");
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

  await decreaseGroupAndParentCommentCount(comment, session);

  comment.isSpam = true;
  return comment.save({ session });
});

const updateOwnComment = async (commentId: string, userId: string, data: { comment?: unknown; gif?: unknown }) => commentTransaction("comment.edited", async session => {
  const comment = await Comment.findOne({ _id: commentId, user: userId, status: COMMENT_STATUS.approved, isSpam: false }, null, { session });
  if (!comment) throw new AppError("Comment not found or you cannot edit it", StatusCodes.FORBIDDEN);
  if (typeof data.comment !== "string" || (!data.comment.trim() && !data.gif))
    throw new AppError("Add a comment or choose a GIF", StatusCodes.BAD_REQUEST);
  if (data.gif != null && !isCommentGif(data.gif))
    throw new AppError("Invalid GIF attachment", StatusCodes.BAD_REQUEST);
  comment.comment = data.comment.trim();
  comment.editedAt = new Date();
  comment.gif = data.gif == null ? undefined : data.gif as CommentGif;
  return comment.save({ session });
});

const deleteOwnComment = async (commentId: string, userId: string) => commentTransaction("comment.deleted", async session => {
  const comment = await Comment.findOne({ _id: commentId, user: userId, status: COMMENT_STATUS.approved, isSpam: false }, null, { session });
  if (!comment) throw new AppError("Comment not found or you cannot delete it", StatusCodes.FORBIDDEN);
  return removeComment(comment, session);
});

const getOwnComments = async (userId: string, requestedPage: number) => {
  const filter = { user: userId, status: COMMENT_STATUS.approved, isSpam: false };
  const pageSize = 10;
  const total = await Comment.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.floor(requestedPage) || 1), pages);
  const comments = await Comment.find(filter)
    .select("user comment gif pageTitle pageUrl parent repliesCount createdAt editedAt status")
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();
  return { comments: JSON.parse(JSON.stringify(comments)) as import("@/interfaces/IComment").IComment[], total, page, pages };
};

export default {
  getOwnComments,
  updateOwnComment,
  deleteOwnComment,
  createComment,
  updateCommentStatus,
  markCommentAsSpam,
  getAllAppComments,
};

// Every write participates in the same transaction as the comment. Atomic
// increments avoid lost updates; transaction retries re-check moderation state.
const changeCommentCounts = async (comment: ICommentDocument, amount: number, session: ClientSession) => {
  if (comment.parent) {
    await Comment.updateOne({ _id: comment.parent }, { $inc: { repliesCount: amount } }, { session });
  }
  const groupId = (comment.group as IGroup)?._id ?? comment.group;
  await Group.updateOne({ _id: groupId }, { $inc: { commentsCount: amount } }, { session });
};
const removeComment = async (
  userComment: ICommentDocument | null,
  session: ClientSession
): Promise<ICommentDocument> => {
  if (!userComment)
    throw new AppError(
      "Comment with that id not found or user doesn't have sufficient permission for this action.",
      StatusCodes.BAD_REQUEST
    );

  if (userComment.status === COMMENT_STATUS.deleted)
    throw new AppError("Comment is already deleted", StatusCodes.BAD_REQUEST);

  userComment.$locals.deletedCount = await decreaseGroupAndParentCommentCount(userComment, session);

  userComment.status = COMMENT_STATUS.deleted;
  return userComment.save({ session });
};

const decreaseGroupAndParentCommentCount = async (comment: ICommentDocument, session: ClientSession) => {
  if (comment.status !== COMMENT_STATUS.approved || comment.isSpam) return 0;
  await changeCommentCounts(comment, -1, session);
  return 1;
};
