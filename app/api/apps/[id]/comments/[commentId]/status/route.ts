import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import commentService from "@/services/commentService";
import AppError from "@/utils/appError";
import catchAsync from "@/utils/errorHandler";
import { StatusCodes } from "http-status-codes";
import { getServerSession } from "next-auth";

export const PATCH = catchAsync(async function (
  req: Request,
  { params: { commentId } }: { params: { commentId: string } }
) {
  await dbConnect();
  const session = await getServerSession(options);
  if (!session)
    throw new AppError(
      "You need to be logged in to post a comment",
      StatusCodes.FORBIDDEN
    );

  const body = await req.json();
  const comment = await commentService.updateCommentStatus({
    commentId,
    userId: session.user.id as any,
    status: body.status,
  });

  return Response.json({
    status: "success",
    data: comment,
  });
});
