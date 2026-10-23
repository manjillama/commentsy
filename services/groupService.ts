import _ from "lodash";
import Group from "@/models/Group";
import factoryService from "./factoryService";

const getAppGroups = (appId: string, ownerId: string, queryParams: any) => {
  const query = _.pick(queryParams, ["limit", "page", "sort"]) as {};

  return factoryService
    .find(Group, {
      ...query,
      app: appId,
      owner: ownerId,
      fields: "_id, identifier, likesCount, commentsCount, createdAt",
    })
    .lean()
    .exec();
};

export default { getAppGroups };
