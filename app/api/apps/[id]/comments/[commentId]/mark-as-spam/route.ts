import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import commentService from "@/services/commentService";
import AppError from "@/utils/appError";
import catchAsync from "@/utils/errorHandler";
import { StatusCodes } from "http-status-codes";
import { getServerSession } from "next-auth";

export const PATCH = catchAsync(async function (
  req: Request,
  { params: { id, commentId } }: { params: { id: string; commentId: string } }
) {
  await dbConnect();
  const session = await getServerSession(options);
  if (!session?.user.id)
    throw new AppError(
      "You need to be logged in to post a comment",
      StatusCodes.FORBIDDEN
    );
  const comment = await commentService.markCommentAsSpam({
    commentId,
    appId: id,
    userId: session.user.id,
  });

  return Response.json({
    status: "success",
    data: comment,
  });
});
