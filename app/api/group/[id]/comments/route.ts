import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import userCommentService from "@/services/commentService";
import AppError from "@/utils/appError";
import catchAsync from "@/utils/errorHandler";
import { StatusCodes } from "http-status-codes";
import { getServerSession } from "next-auth";

export const GET = catchAsync(async function (
  req: Request,
  { params: { id } }: { params: { id: string } }
) {
  await dbConnect();
  const session = await getServerSession(options);
  if (!session)
    throw new AppError(
      "You need to be logged in to post a comment",
      StatusCodes.FORBIDDEN
    );
  const comments = await userCommentService.getAllGroupComments({
    userId: session?.user.id as string,
    groupId: id,
  });

  return Response.json({ status: "success", data: comments });
});
