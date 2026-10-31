import dbConnect from '@/lib/dbConnect';
import catchAsync from '@/utils/errorHandler';
import { readJsonBody } from '@/utils/requestBody';
import { enforceRateLimit, requestClientKey } from '@/utils/rateLimit';
import { sendVerification } from '@/services/accountEmailService';

export const POST = catchAsync(async (req: Request) => {
  await dbConnect();
  await enforceRateLimit(`verify-resend-client:${requestClientKey(req)}`, 5, 15 * 60_000);
  const body = await readJsonBody(req);
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    await enforceRateLimit(`verify-resend-email:${email}`, 3, 60 * 60_000);
    await sendVerification(email);
  }
  return Response.json({ status: 'success', data: { message: 'If an unverified email/password account exists, we’ll send a confirmation link.' } }, { headers: { 'Cache-Control': 'no-store' } });
});
