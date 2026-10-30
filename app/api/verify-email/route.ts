import dbConnect from '@/lib/dbConnect';
import catchAsync from '@/utils/errorHandler';
import { readJsonBody } from '@/utils/requestBody';
import { enforceRateLimit, requestClientKey } from '@/utils/rateLimit';
import { verifyEmail } from '@/services/accountEmailService';

export const POST = catchAsync(async (req: Request) => {
  await dbConnect();
  await enforceRateLimit(`verify-email:${requestClientKey(req)}`, 10, 15 * 60_000);
  const body = await readJsonBody(req);
  await verifyEmail(body.token);
  return Response.json({ status: 'success', data: { message: 'Email confirmed. You can now sign in.' } }, { headers: { 'Cache-Control': 'no-store' } });
});
