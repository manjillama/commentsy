import dbConnect from "@/lib/dbConnect";
import catchAsync from "@/utils/errorHandler";
import { readJsonBody } from "@/utils/requestBody";
import { enforceRateLimit, requestClientKey } from "@/utils/rateLimit";
import { resetPassword } from "@/services/passwordResetService";

export const POST = catchAsync(async (req: Request) => {
  await dbConnect();
  await enforceRateLimit(`password-reset-submit:${requestClientKey(req)}`, 10, 15 * 60_000);
  const body = await readJsonBody(req);
  await resetPassword(body.token, body.password);
  return Response.json({ status: "success", data: { message: "Your password has been reset. Sign in with your new password." } }, { headers: { "Cache-Control": "no-store" } });
});
