import App from "@/models/App";
import Comment from "@/models/Comment";
import Group from "@/models/Group";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";
import { ICommentDocument } from "@/interfaces/IComment";
import factoryService from "./factoryService";
import _ from "lodash";
import { COMMENT_STATUS } from "@/interfaces/IGroup";

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
      status: COMMENT_STATUS.approved,
      fields:
        "_id, repliesCount, comment, parentComment, pageTitle, pageUrl, createdAt",
    })
    .populate({ path: "user", select: "name image avatarBackgroundColor -_id" })
    .lean()
    .exec();
};

const createComment = async ({
  appCode,
  groupIdentifier,
  userId,
  pageTitle,
  pageUrl,
  comment,
  parentCommentId,
}: {
  appCode: string;
  groupIdentifier: string;
  userId: string;
  pageTitle: string;
  pageUrl: string;
  comment: string;
  parentCommentId: string;
}) => {
  if (
    !appCode ||
    !groupIdentifier ||
    !userId ||
    !comment ||
    !pageTitle ||
    !pageUrl
  )
    throw new AppError(
      "Missing one or more fields app code (appCode), group identifier (identifier), page title (pageTitle), page url (pageUrl), comment or user id",
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

  const userComment = new Comment({
    app: app._id,
    group: group._id,
    parent: parentCommentId,
    user: userId,
    pageTitle,
    pageUrl,
    comment,
    isApproved: true,
  });

  await userComment.validate();

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

  return userComment.save();
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

  await _removeCommentAndCleanUp(userComment);
};

export default { createComment, removeComment, getAllAppComments };

const _removeCommentAndCleanUp = (userComment: ICommentDocument | null) => {
  if (!userComment)
    throw new AppError(
      "Comment with that id not found or user doesn't have sufficient permission for this action.",
      StatusCodes.BAD_REQUEST
    );

  if (userComment.status === "deleted")
    throw new AppError("Comment is already deleted", StatusCodes.BAD_REQUEST);

  let totalCommentsCountToBeDecreased = 0;

  const isAReply = userComment.parent;

  /**
   * If comment to be deleted is a reply then update parent comment and group comment count.
   * If comment to be deleted is a parent comment then delete all child comment as well and update group count.
   */
  if (isAReply) {
    totalCommentsCountToBeDecreased = 1;
    Comment.findById(userComment.parent).then((parentComment) => {
      if (parentComment) {
        parentComment.repliesCount = parentComment.repliesCount - 1;
        parentComment.save();
      }
    });
  } else {
    Comment.updateMany(
      {
        parent: userComment.parent,
      },
      {
        $set: {
          status: "deleted",
        },
      }
    );
    totalCommentsCountToBeDecreased = userComment.repliesCount + 1;
  }

  Group.findById(userComment.group).then((group) => {
    if (group) {
      group.commentsCount =
        group.commentsCount - totalCommentsCountToBeDecreased;
      group.save();
    }
  });

  userComment.status = "deleted";
  return userComment.save();
};
