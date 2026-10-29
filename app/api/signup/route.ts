import logger from "@/utils/logger";
import { readJsonBody } from "@/utils/requestBody";
import { enforceRateLimit, requestClientKey } from "@/utils/rateLimit";
import AppError from "@/utils/appError";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import catchAsync from "@/utils/errorHandler";

export const POST = catchAsync(async function (req: Request) {
  await dbConnect();

  await enforceRateLimit(`signup:${requestClientKey(req)}`, 5);
  const body = await readJsonBody(req);
  if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 100 || Buffer.byteLength(body.password, "utf8") > 72)
    throw new AppError("Enter a password of at least 8 characters and at most 72 UTF-8 bytes", 400);
  if (typeof body.name !== "string" || !body.name.trim() || typeof body.email !== "string")
    throw new AppError("Enter your name and email address", 400);
  const user: any = await User.create({
    name: body.name.trim(), email: body.email, password: body.password, provider: "credentials",
  });
  logger.info("account.created", { provider: "credentials" });
  user.password = undefined;

  return Response.json({ status: "success", data: user });
});
