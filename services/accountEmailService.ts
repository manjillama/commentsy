import { safeErrorDetails } from "@/utils/logContext";
import { createHash, randomBytes } from 'crypto';
import User from '@/models/User';
import logger from '@/utils/logger';
import AppError from '@/utils/appError';
import { accountEmail } from '@/utils/emails/accountEmail';

async function send(email: string, verificationUrl?: string, idempotencyKey?: string) {
  if (!process.env.RESEND_API_KEY) throw new Error('Email unavailable');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || 'Commentsy <no-reply@commentsy.com>', to: [email], subject: verificationUrl ? 'Confirm your Commentsy email' : 'Welcome to Commentsy', ...accountEmail(verificationUrl) }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    const error = new Error('Email delivery rejected') as Error & { code: number };
    error.code = response.status;
    throw error;
  }
}

export async function sendVerification(email: string) {
  let stage = 'token_storage';
  try {
    const token = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(token).digest('hex');
    const result = await User.updateOne({ email, provider: 'credentials', isEmailVerified: { $ne: true } }, { $set: {
      emailVerificationHash: hash, emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60_000),
    } });
    if (!result.modifiedCount) return false;
    stage = 'site_url';
    const url = new URL('/verify-email', process.env.NEXT_PUBLIC_SITE_URL);
    // Fragments are not sent to the server or its access logs.
    url.hash = token;
    stage = process.env.RESEND_API_KEY ? 'delivery' : 'email_configuration';
    await send(email, url.href);
    logger.info('email.verification_sent');
    return true;
  } catch (error) {
    logger.error('email.verification_failed', { stage, ...safeErrorDetails(error) });
    return false;
  }
}

export async function sendWelcome(userId: string, email: string) {
  let claimed = false;
  try {
    const claim = await User.updateOne({
      _id: userId, welcomeEmailSentAt: null,
      $or: [{ welcomeEmailClaimedAt: null }, { welcomeEmailClaimedAt: { $lt: new Date(Date.now() - 60_000) } }],
    }, { $set: { welcomeEmailClaimedAt: new Date() } });
    if (!claim.modifiedCount) return;
    claimed = true;
    await send(email, undefined, `welcome-${userId}`);
    await User.updateOne({ _id: userId }, { $set: { welcomeEmailSentAt: new Date() }, $unset: { welcomeEmailClaimedAt: 1 } });
    logger.info('email.welcome_accepted');
  } catch (error) {
    logger.error('email.welcome_failed', safeErrorDetails(error));
    if (claimed) {
      try { await User.updateOne({ _id: userId }, { $unset: { welcomeEmailClaimedAt: 1 } }); }
      catch (cleanupError) { logger.error('email.welcome_claim_cleanup_failed', safeErrorDetails(cleanupError)); }
    }
  }
}

export async function verifyEmail(token: unknown) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new AppError('This verification link is invalid or expired. Request a new one.', 400);
  const user = await User.findOneAndUpdate({
    provider: 'credentials', isEmailVerified: { $ne: true },
    emailVerificationHash: createHash('sha256').update(token).digest('hex'), emailVerificationExpires: { $gt: new Date() },
  }, { $set: { isEmailVerified: true }, $unset: { emailVerificationHash: 1, emailVerificationExpires: 1 } }, { new: true });
  if (!user) throw new AppError('This verification link is invalid or expired. Request a new one.', 400);
  await sendWelcome(String(user._id), user.email);
}
