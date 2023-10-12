import App from "@/models/App";
import Comment from "@/models/Comment";
import Group from "@/models/Collection";
import factoryService from "./factoryService";
import { IComment } from "@/interfaces/IComment";
import _ from "lodash";
import { IGroup } from "@/interfaces/IGroup";

export type ClientGroupCommentsReturnType =
  | {
      status: "fail";
      message: string;
    }
  | {
      status: "success";
      data: {
        identifier: string;
        likesCount: number;
        commentsCount: number;
        comments: IComment[];
        total: number;
        size: number;
      };
    };

const getAllGroupComments = async ({
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
    .select("identifier likesCount commentsCount -_id")
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

  if (!app.authorizedOrigins.includes(baseUrl))
    return {
      status: "fail",
      message: "Authorization error, URI mismatch",
    };

  const query = _.pick(searchParams, ["limit", "page", "sort"]);

  const [comments, total, size] = await factoryService
    .find(Comment, {
      ...query,
      // limit: 20,
      isRemoved: false,
      parent: null,
      group: group._id,
      fields: "_id, repliesCount, comment, createdAt, isRemoved",
    })
    .populate({ path: "user", select: "name -_id" })
    .lean()
    .exec();

  return {
    status: "success",
    data: {
      identifier: group.identifier,
      likesCount: group.likesCount,
      commentsCount: group.commentsCount,
      comments: comments as IComment[],
      total,
      size,
    },
  };
};

export default { getAllGroupComments };
