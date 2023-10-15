import dbConnect from "@/lib/dbConnect";
import catchAsync from "@/utils/errorHandler";
import { options } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";

export const GET = catchAsync(async function (
  req: Request,
  { params: { id } }: { params: { id: string } }
) {
  await dbConnect();
  const session = await getServerSession(options);
  if (!session)
    throw new AppError(
      "You need to be logged in to commentsy",
      StatusCodes.FORBIDDEN
    );

  return Response.json({ status: "success", data: "Groups route" });
});
