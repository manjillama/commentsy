import dbConnect from "@/lib/dbConnect";
import publicCommentService from "@/services/publicCommentService";
import catchAsync from "@/utils/errorHandler";
import { NextRequest } from "next/server";

export const GET = catchAsync(async function (
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  await dbConnect();
  const searchParams = req.nextUrl.searchParams;
  const params = Object.fromEntries(searchParams);

  const [comments, total, size] =
    await publicCommentService.getAllCommentReplies(id, params);

  return Response.json({
    status: "success",
    data: {
      comments,
      total,
      size,
    },
  });
});
