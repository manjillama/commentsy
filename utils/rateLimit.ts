import logger from "@/utils/logger";
import { createHmac } from "crypto";
import RateLimit from "@/models/RateLimit";
import AppError from "@/utils/appError";

/** Only use an IP header when the deployment's trusted proxy overwrites it. */
export function requestClientKey(req: Pick<Request, "headers">): string {
  const header = process.env.RATE_LIMIT_IP_HEADER || (process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : "");
  return (header ? req.headers.get(header)?.split(",")[0].trim().slice(0, 256) : null) || "shared";
}

/** Shared fixed-window limits survive restarts and apply across server instances. */
export async function enforceRateLimit(key: string, limit: number, windowMs = 60_000) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for rate limiting");
  const window = Math.floor(Date.now() / windowMs);
  const id = createHmac("sha256", secret).update(`${key}:${window}`).digest("hex");
  const update = {
    $inc: { count: 1 },
    $setOnInsert: { expiresAt: new Date((window + 1) * windowMs) },
  };
  let bucket;
  try {
    bucket = await RateLimit.findOneAndUpdate({ _id: id }, update, { upsert: true, new: true });
  } catch (error: any) {
    // Handle competing upserts of a window's first request.
    if (error?.code !== 11000) throw error;
    bucket = await RateLimit.findOneAndUpdate({ _id: id }, update, { new: true });
  }
  if (!bucket || bucket.count > limit) {
    const error = new AppError("Too many requests. Please try again shortly.", 429);
    error.retryAfter = Math.max(1, Math.ceil(((window + 1) * windowMs - Date.now()) / 1000));
    if (!bucket || bucket.count === limit + 1) {
      const prefix = key.split(":")[0];
      const scope = ["comment-client", "comment-app", "signup", "login"].includes(prefix) ? prefix : "other";
      logger.warn("rate_limit.exceeded", { scope, limit, windowMs, retryAfter: error.retryAfter });
    }
    throw error;
  }
}
