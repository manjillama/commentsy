import logger from "@/utils/logger";
import { createHmac } from "crypto";
import RateLimit from "@/models/RateLimit";
import AppError from "@/utils/appError";

/** Only use an IP header when the deployment's trusted proxy overwrites it. */
export function requestClientKey(req: Pick<Request, "headers">): string {
  const header =
    process.env.RATE_LIMIT_IP_HEADER ||
    (process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : "");
  return (
    (header
      ? req.headers.get(header)?.split(",")[0].trim().slice(0, 256)
      : null) || "shared"
  );
}

/** Shared fixed-window limits survive restarts and apply across server instances. */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowMs = 60_000,
) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const limitsEnabledInDevelopment = process.env.RATE_LIMIT_IN_DEV === "true";
  if (isDevelopment && !limitsEnabledInDevelopment) return;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for rate limiting");

  const windowNumber = Math.floor(Date.now() / windowMs);
  const windowEndsAt = (windowNumber + 1) * windowMs;
  const environmentPrefix = isDevelopment ? "development:" : "";

  // Hash the key so stored buckets don't expose client IPs or email addresses.
  const bucketId = createHmac("sha256", secret)
    .update(`${environmentPrefix}${key}:${windowNumber}`)
    .digest("hex");
  const bucketFilter = { _id: bucketId };
  const incrementCount = {
    $inc: { count: 1 },
    $setOnInsert: { expiresAt: new Date(windowEndsAt) },
  };

  let bucket;
  try {
    bucket = await RateLimit.findOneAndUpdate(bucketFilter, incrementCount, {
      upsert: true,
      new: true,
    });
  } catch (error: any) {
    const anotherRequestCreatedBucket = error?.code === 11000;
    if (!anotherRequestCreatedBucket) throw error;

    // Another request created the bucket first. Increment that existing bucket.
    bucket = await RateLimit.findOneAndUpdate(bucketFilter, incrementCount, {
      new: true,
    });
  }

  const limitExceeded = !bucket || bucket.count > limit;
  if (!limitExceeded) return;

  const secondsUntilReset = Math.ceil((windowEndsAt - Date.now()) / 1000);
  const error = new AppError("Too many requests. Please try again shortly.", 429);
  error.retryAfter = Math.max(1, secondsUntilReset);

  // Log the first rejection in this window, rather than every blocked request.
  const shouldLogRejection = !bucket || bucket.count === limit + 1;
  if (shouldLogRejection) {
    const keyPrefix = key.split(":")[0];
    const knownScopes = ["comment-client", "comment-app", "signup", "login"];
    const scope = knownScopes.includes(keyPrefix) ? keyPrefix : "other";

    logger.warn("rate_limit.exceeded", {
      scope,
      limit,
      windowMs,
      retryAfter: error.retryAfter,
    });
  }

  throw error;
}
