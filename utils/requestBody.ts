import AppError from "@/utils/appError";
import { webOrigin } from "@/utils/origin";

/** Cookie-authenticated writes must come from the Commentsy origin. */
export function validateWriteRequest(req: Request) {
  const expected = webOrigin(process.env.NEXTAUTH_URL ?? req.url);
  const origin = req.headers.get("origin");
  if ((origin && origin !== expected) || req.headers.get("sec-fetch-site") === "cross-site")
    throw new AppError("Invalid request origin", 403);
  if (["POST", "PATCH", "PUT"].includes(req.method) && req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json")
    throw new AppError("Send an application/json request", 415);
}

/** Bound request size before parsing and reject non-object JSON bodies. */
export async function readJsonBody(req: Request, maxBytes = 32_768): Promise<Record<string, any>> {
  if (!req.body) throw new AppError("Missing request body", 400);
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new AppError("Request body is too large", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new AppError("Enter valid JSON", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new AppError("Send a JSON object", 400);
  return body;
}
