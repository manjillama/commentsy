import _ from "lodash";
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

  let group: IGroup | null = await Group.findOne({
    app: app?._id,
    identifier: groupIdentifier,
  })
    .select("identifier likesCount commentsCount")
    .lean();

  if (!group)
    group = await Group.create({
      identifier: groupIdentifier,
      owner: app.user,
      app: app._id,
    });

  if (!group)
    return {
      status: "fail",
      message: "Comments group with that identifier could not be created",
    };

  const parsedUrl = new URL(refererUrl);
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

  if (!app.authorizedOrigins.some((url) => isSameDomain(url, baseUrl)))
    return {
      status: "fail",
      message: "Authorization error, URI mismatch",
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
      commentStyles: JSON.parse(app.commentStyles),
      total,
      totalCommentsAndReplies: group.commentsCount,
      size,
    },
  };
};

const getAllGroupComments = async (
  groupIdentifier: string,
  queryParams: any
): Promise<[ICommentDocument[], number, number]> => {
  const group = await Group.findOne({
    identifier: groupIdentifier,
  }).lean();

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

const _fetchComments = (options: any, queryParams: any) => {
  const query = _.pick(queryParams, ["limit", "page", "sort"]) as {};

  return factoryService
    .find(Comment, {
      limit: 20,
      sort: "-createdAt",
      ...query,
      ...options,
      status: COMMENT_STATUS.approved,
      isSpam: false,
      fields: "_id, repliesCount, commentUser, comment, createdAt, anonUser",
    })
    .populate({ path: "user", select: "name image avatarBackgroundColor -_id" })
    .exec();
};

function isSameDomain(url1: string, url2: string) {
  function removeWww(hostname: string) {
    // Remove "www" if it exists at the beginning of the hostname
    if (hostname.startsWith("www.")) {
      return hostname.slice(4);
    }
    return hostname;
  }
  // Create URL objects for the input URLs
  const parsedUrl1 = new URL(url1);
  const parsedUrl2 = new URL(url2);

  // Remove "www" subdomains from hostnames
  const hostname1 = removeWww(parsedUrl1.hostname);
  const hostname2 = removeWww(parsedUrl2.hostname);

  // Compare the hostnames
  return hostname1 === hostname2;
}

export default {
  getAllGroupCommentsInitData,
  getAllGroupComments,
  getAllCommentReplies,
};
