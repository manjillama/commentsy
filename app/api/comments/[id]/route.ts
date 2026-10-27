import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import commentService from "@/services/commentService";
import catchAsync from "@/utils/errorHandler";
import AppError from "@/utils/appError";

async function requireUser() {
  const session = await getServerSession(options);
  if (!session?.user.id) throw new AppError("Sign in to manage your comments", 401);
  await dbConnect();
  return session.user.id;
}

export const PATCH = catchAsync(async (req, { params: { id } }) => {
  const userId = await requireUser();
  const body = await req.json();
  const comment = await commentService.updateOwnComment(id, userId, body);
  return Response.json({ status: "success", data: comment });
});

export const DELETE = catchAsync(async (_req, { params: { id } }) => {
  const userId = await requireUser();
  await commentService.deleteOwnComment(id, userId);
  return Response.json({ status: "success" });
});
