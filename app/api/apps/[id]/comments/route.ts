import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import commentService from "@/services/commentService";
import AppError from "@/utils/appError";
import catchAsync from "@/utils/errorHandler";
import { StatusCodes } from "http-status-codes";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const GET = catchAsync(async function (
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  await dbConnect();
  const session = await getServerSession(options);
  if (!session)
    throw new AppError(
      "You need to be logged in to post a comment",
      StatusCodes.FORBIDDEN
    );
  const searchParams = req.nextUrl.searchParams;

  const params = Object.fromEntries(searchParams);

  const [comments, total, size] = await commentService.getAllAppComments({
    appId: id,
    userId: session.user.id as string,
    queryParams: params,
  });

  return Response.json({
    status: "success",
    data: {
      comments,
      total,
      size,
    },
  });
});
