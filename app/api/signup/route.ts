import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import catchAsync from "@/utils/errorHandler";

export const POST = catchAsync(async function (req: Request) {
  await dbConnect();

  const body = await req.json();
  body.provider = "credentials";

  const user: any = await User.create(body);
  user.password = undefined;

  return Response.json({ status: "success", data: user });
});
