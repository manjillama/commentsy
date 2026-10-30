import { readJsonBody } from "@/utils/requestBody";
import dbConnect from "@/lib/dbConnect";
import catchAsync from "@/utils/errorHandler";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";
import appService from "@/services/appService";

export const PATCH = catchAsync(async function (
  req: Request,
  { params: { id } }: { params: { id: string } }
) {
  await dbConnect();
  const session = await getServerSession(options);

  if (!session?.user.id)
    throw new AppError(
      "You need to be logged in to commentsy",
      StatusCodes.FORBIDDEN
    );

  const body = await readJsonBody(req);

  const app = await appService.updateApp(id, body, session.user.id);

  return Response.json({
    status: "success",
    data: app,
  });
});
