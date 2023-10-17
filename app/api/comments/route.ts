import dbConnect from "@/lib/dbConnect";
import commentService from "@/services/commentService";
import AppError from "@/utils/appError";
import catchAsync from "@/utils/errorHandler";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { StatusCodes } from "http-status-codes";
import { NextRequest } from "next/server";
import publicCommentService from "@/services/publicCommentService";

export const GET = catchAsync(async function (req: NextRequest) {
  await dbConnect();

  const searchParams = req.nextUrl.searchParams;
  const { identifier, ...params } = Object.fromEntries(searchParams);

  const [comments, total, size] =
    await publicCommentService.getAllGroupComments(identifier, params);

  return Response.json({
    status: "success",
    data: {
      comments,
      total,
      size,
    },
  });
});

export const POST = catchAsync(async function (req: Request) {
  await dbConnect();
  const session = await getServerSession(options);
  if (!session)
    throw new AppError(
      "You need to be logged in to post a comment",
      StatusCodes.FORBIDDEN
    );

  const { appCode, identifier, comment, parentCommentId, pageTitle, pageUrl } =
    await req.json();

  const userComment = await commentService.createComment({
    appCode,
    groupIdentifier: identifier,
    pageTitle,
    pageUrl,
    parentCommentId,
    comment,
    userId: session.user.id as string,
  });

  return Response.json({ status: "success", data: userComment });
});

export const DELETE = catchAsync(async function (req: Request) {
  await dbConnect();
  const session = await getServerSession(options);
  if (!session)
    throw new AppError(
      "You need to be logged in to post a comment",
      StatusCodes.FORBIDDEN
    );

  const { commentId } = await req.json();

  await commentService.removeComment({
    commentId,
    userId: session.user.id as string,
  });

  return Response.json({ status: "success", data: null });
});
