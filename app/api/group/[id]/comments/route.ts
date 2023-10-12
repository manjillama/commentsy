import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import appGroupCommentService from "@/services/appPostCommentService";
import catchAsync from "@/utils/errorHandler";
import { getServerSession } from "next-auth";

export const GET = catchAsync(async function (
  req: Request,
  { params: { id } }: { params: { id: string } }
) {
  await dbConnect();
  const session = await getServerSession(options);

  const comments = await appGroupCommentService.getAllAppGroupComments({
    userId: session?.user.id as string,
    groupId: id,
  });

  return Response.json({ status: "success", data: comments });
});
