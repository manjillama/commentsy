import Comment from "@/models/Comment";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";

const getAllAppGroupComments = async ({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) => {
  if (!userId || !groupId)
    throw new AppError(
      "Missing group id (groupId) or user id",
      StatusCodes.BAD_REQUEST
    );
  return Comment.find({ user: userId, group: groupId });
};

export default { getAllAppGroupComments };
