import { readJsonBody } from "@/utils/requestBody";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import accountService from "@/services/accountService";
import AppError from "@/utils/appError";
import catchAsync from "@/utils/errorHandler";

async function requireAccount(req: Request) {
  const origin = req.headers.get("origin");
  const expectedOrigin = new URL(process.env.NEXTAUTH_URL ?? req.url).origin;
  if (origin && origin !== expectedOrigin) throw new AppError("Invalid request origin", 403);
  const session = await getServerSession(options);
  if (!session?.user.id) throw new AppError("Sign in to manage your account", 401);
  await dbConnect();
  return session.user.id;
}

export const PATCH = catchAsync(async req => {
  const userId = await requireAccount(req);
  const account = await accountService.updateProfile(userId, await readJsonBody(req));
  return Response.json({ status: "success", data: account });
});

export const POST = catchAsync(async req => {
  const userId = await requireAccount(req);
  await accountService.changePassword(userId, await readJsonBody(req));
  return Response.json({ status: "success", data: null });
});
