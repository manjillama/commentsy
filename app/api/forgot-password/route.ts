import dbConnect from "@/lib/dbConnect";
import catchAsync from "@/utils/errorHandler";
import { readJsonBody } from "@/utils/requestBody";
import { enforceRateLimit, requestClientKey } from "@/utils/rateLimit";
import { requestPasswordReset, resetRequestMessage } from "@/services/passwordResetService";

export const POST = catchAsync(async (req: Request) => {
  await dbConnect();
  await enforceRateLimit(`password-reset-client:${requestClientKey(req)}`, 5, 15 * 60_000);
  const body = await readJsonBody(req);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    await enforceRateLimit(`password-reset-email:${email}`, 3, 60 * 60_000);
    await requestPasswordReset(email);
  }
  return Response.json({ status: "success", data: { message: resetRequestMessage } }, { headers: { "Cache-Control": "no-store" } });
});
