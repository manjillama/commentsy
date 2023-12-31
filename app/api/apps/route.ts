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
  const apps = await appService.getAppsByUserId(session?.user.id as string);

  return Response.json({ status: "success", data: apps });
});

export const POST = catchAsync(async function (req: Request) {
  await dbConnect();
  const session = await getServerSession(options);

  if (!session)
    throw new AppError(
      "You need to be logged in to commentsy",
      StatusCodes.FORBIDDEN
    );

  const body = await req.json();
  const app = await appService.createApp(body, session?.user.id as string);

  return Response.json({ status: "success", data: app });
});
