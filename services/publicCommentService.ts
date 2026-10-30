import _ from "lodash";
import { commentCursorFilter } from "@/utils/commentCursor";
import { isAuthorizedPage } from "@/utils/origin";
import { parseCommentStyles } from "@/utils/commentStyles";
import App from "@/models/App";
import Comment from "@/models/Comment";
import Group from "@/models/Group";
import factoryService from "./factoryService";
import { IComment, ICommentDocument } from "@/interfaces/IComment";
import { COMMENT_STATUS, IGroup } from "@/interfaces/IGroup";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";
import { CommentStyles } from "@/interfaces/IApp";

export type ClientGroupCommentsReturnType =
  | {
      status: "fail";
      message: string;
    }
  | {
      status: "success";
      data: {
        appCode: string;
        identifier: string;
        likesCount: number;
        commentsCount: number;
        comments: IComment[];
        commentStyles: CommentStyles;
        total: number;
        totalCommentsAndReplies: number;
        size: number;
      };
    };

const getAllGroupCommentsInitData = async ({
  appCode,
  groupIdentifier,
  refererUrl,
  searchParams,
}: {
  appCode: string;
  groupIdentifier: string;
  refererUrl: string;
  searchParams?: any;
}): Promise<ClientGroupCommentsReturnType> => {
  const app = await App.findOne({ code: appCode }).lean();

  if (!app || !appCode || !groupIdentifier)
    return {
      status: "fail",
      message: "Invalid or missing parameters.",
    };

  // Validate before any writes, including creating a new conversation.
  if (!isAuthorizedPage(app.authorizedOrigins, refererUrl))
    return { status: "fail", message: "Authorization error, URI mismatch" };

  let group: IGroup | null = await Group.findOne({
    app: app?._id,
    identifier: groupIdentifier,
  })
    .select("identifier likesCount commentsCount")
    .lean();

  if (!group) {
    try {
      group = await Group.create({ identifier: groupIdentifier, owner: app.user, app: app._id });
    } catch (error: any) {
      // Another first visitor may have created the same conversation.
      if (error?.code !== 11000) throw error;
      group = await Group.findOne({ app: app._id, identifier: groupIdentifier }).lean();
    }
  }

  if (!group)
    return {
      status: "fail",
      message: "Comments group with that identifier could not be created",
    };

  const [comments, total, size] = await _fetchCommentsWithGroupId(
    group._id,
    searchParams
  );

  return {
    status: "success",
    data: {
      appCode,
      identifier: group.identifier,
      likesCount: group.likesCount,
      commentsCount: group.commentsCount,
      comments: comments as IComment[],
      commentStyles: parseCommentStyles(app.commentStyles),
      total,
      totalCommentsAndReplies: group.commentsCount,
      size,
    },
  };
};

const getAllGroupComments = async (
  appCode: string,
  groupIdentifier: string,
  queryParams: any
): Promise<[ICommentDocument[], number, number]> => {
  if (typeof appCode !== "string" || !appCode || typeof groupIdentifier !== "string" || !groupIdentifier)
    throw new AppError("Missing app code or page identifier", StatusCodes.BAD_REQUEST);
  const app = await App.findOne({ code: appCode }).lean();
  if (!app) throw new AppError("App not found", StatusCodes.NOT_FOUND);
  const group = await Group.findOne({ app: app._id, identifier: groupIdentifier }).lean();

  if (!group)
    throw new AppError(
      "Comments group with that id was not found",
      StatusCodes.BAD_REQUEST
    );

  return _fetchCommentsWithGroupId(group._id, queryParams);
};

const getAllCommentReplies = async (
  parentCommentId: string,
  queryParams: any
): Promise<[ICommentDocument[], number, number]> => {
  return _fetchCommentRepliesWithParentId(parentCommentId, queryParams);
};

const _fetchCommentRepliesWithParentId = (
  parentCommentId: string,
  queryParams: any
): Promise<[ICommentDocument[], number, number]> => {
  return _fetchComments({ parent: parentCommentId }, queryParams);
};

const _fetchCommentsWithGroupId = (
  groupId: string,
  queryParams: any
): Promise<[ICommentDocument[], number, number]> => {
  return _fetchComments({ parent: null, group: groupId }, queryParams);
};

const _fetchComments = async (options: any, queryParams: any) => {
  const query = _.pick(queryParams, ["limit", "page"]) as {};
  const sort = queryParams?.sort === "createdAt" ? "createdAt,_id" : "-createdAt,-_id";

  const filter = {
    ...options,
    ...(options.parent === null ? {
      $or: [
        { status: COMMENT_STATUS.approved, isSpam: false },
        { repliesCount: { $gt: 0 }, $or: [{ status: COMMENT_STATUS.deleted }, { isSpam: true }] },
      ],
    } : { status: COMMENT_STATUS.approved, isSpam: false }),
  };
  const cursor = queryParams?.after ? { $and: [commentCursorFilter(queryParams.after, sort === "createdAt,_id")] } : {};
  const [comments, total, size] = await factoryService
    .find(Comment, {
      limit: 20,
      ...query,
      // Cursor requests start at the boundary rather than a mutable page offset.
      ...(queryParams?.after ? { page: 1 } : {}),
      sort,
      ...filter,
      ...cursor,
      fields: "_id, parent, status, isSpam, repliesCount, commentUser, user, comment, gif, editedAt, createdAt, anonUser",
    }, filter)
    .populate({ path: "user", select: "name image avatarBackgroundColor" })
    .exec();
  // Never send removed content or its author details to the public widget.
  const visible = comments.map(comment => {
    if (comment.status === COMMENT_STATUS.approved && !comment.isSpam) return comment;
    return { _id: comment._id, parent: comment.parent, status: "deleted", repliesCount: comment.repliesCount,
      createdAt: comment.createdAt, comment: "", commentUser: { name: "Deleted comment", avatarBackgroundColor: "#d4d4d4" } };
  });
  return [visible as ICommentDocument[], total, size] as [ICommentDocument[], number, number];
};

export default {
  getAllGroupCommentsInitData,
  getAllGroupComments,
  getAllCommentReplies,
};
