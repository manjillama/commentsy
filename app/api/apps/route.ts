import { readJsonBody } from "@/utils/requestBody";
import dbConnect from "@/lib/dbConnect";
import catchAsync from "@/utils/errorHandler";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import appService from "@/services/appService";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";

export const GET = catchAsync(async function (req: Request) {
  await dbConnect();
  const session = await getServerSession(options);
  if (!session?.user.id) throw new AppError("Sign in to manage your sites", StatusCodes.UNAUTHORIZED);
  const apps = await appService.getAppsByUserId(session?.user.id as string);

  return Response.json({ status: "success", data: apps });
});

export const POST = catchAsync(async function (req: Request) {
  await dbConnect();
  const session = await getServerSession(options);

  if (!session?.user.id)
    throw new AppError(
      "You need to be logged in to commentsy",
      StatusCodes.FORBIDDEN
    );

  const body = await readJsonBody(req);
  const app = await appService.createApp({ name: body.name, description: body.description, authorizedOrigins: body.authorizedOrigins, requireGuestApproval: body.requireGuestApproval }, session.user.id);

  return Response.json({ status: "success", data: app });
});
