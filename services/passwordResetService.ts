import { passwordResetEmail } from "@/utils/emails/passwordReset";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcrypt";
import User from "@/models/User";
import AppError from "@/utils/appError";
import logger from "@/utils/logger";

export const resetRequestMessage = "If an eligible account exists, we’ll email you a password reset link.";
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function requestPasswordReset(email: string) {
  const user = await User.findOne({ email, provider: "credentials" }).select("_id").lean();
  if (!user) return;
  if (!process.env.RESEND_API_KEY) {
    logger.error("password_reset.email_unconfigured");
    return;
  }
  const token = randomBytes(32).toString("hex");
  const tokenHash = digest(token);
  const url = new URL("/reset-password", process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set("token", token);
  await User.updateOne({ _id: user._id, provider: "credentials" }, { $set: {
    passwordResetHash: tokenHash, passwordResetExpires: new Date(Date.now() + 30 * 60_000),
  } });
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Commentsy <no-reply@commentsy.com>",
        to: [email], subject: "Reset your Commentsy password",
        ...passwordResetEmail(url.href),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Email delivery rejected");
    logger.info("password_reset.email_sent");
  } catch {
    await User.updateOne({ _id: user._id, passwordResetHash: tokenHash }, { $unset: { passwordResetHash: 1, passwordResetExpires: 1 } });
    // Never log the recipient, reset URL, token, or provider response.
    logger.error("password_reset.email_failed");
  }
}

export async function resetPassword(token: unknown, password: unknown) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
    throw new AppError("This reset link is invalid or has expired. Request a new one.", 400);
  if (typeof password !== "string" || password.length < 8 || password.length > 100 || Buffer.byteLength(password, "utf8") > 72)
    throw new AppError("Enter a password of at least 8 characters and at most 72 UTF-8 bytes", 400);
  const passwordHash = await bcrypt.hash(password, 12);
  // Consume the token and change the password together: concurrent replays cannot succeed.
  const result = await User.updateOne({
    provider: "credentials", passwordResetHash: digest(token), passwordResetExpires: { $gt: new Date() },
  }, {
    $set: { password: passwordHash },
    $unset: { passwordResetHash: 1, passwordResetExpires: 1 },
    $inc: { sessionVersion: 1 },
  });
  if (!result.modifiedCount) throw new AppError("This reset link is invalid or has expired. Request a new one.", 400);
  logger.info("password_reset.completed");
}
