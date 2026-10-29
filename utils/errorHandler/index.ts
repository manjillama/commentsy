import { randomUUID } from "node:crypto";
import { safeErrorDetails, withRequestLogContext } from "@/utils/logContext";
import { config } from "@/config";
import AppError from "../appError";
import OE from "./operationalErrors";
import { StatusCodes } from "http-status-codes";
import { NextRequest } from "next/server";
import logger from "@/utils/logger";
import { validateWriteRequest } from "@/utils/requestBody";

export default function catchAsync(
  asyncFunction: (req: NextRequest, data?: any) => Promise<Response>
) {
  return async (req: NextRequest, data?: any) => {
    const started = Date.now();
    const context = { requestId: randomUUID(), method: req.method, path: new URL(req.url).pathname };
    return withRequestLogContext(context, async () => {
      let response: Response;
      let failure: unknown;
      try {
        if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !context.path.startsWith("/api/auth/"))
          validateWriteRequest(req);
        response = await asyncFunction(req, data);
      } catch (error: any) {
        const caught = error instanceof Error ? error : new Error("Non-error rejection");
        failure = caught;
        response = sendError(markOperationalError(caught as AppError));
      }
      const fields = { ...context, status: response.status, elapsedMs: Date.now() - started };
      if (response.status >= 500) {
        logger.error("api.failed", { ...fields, ...(failure ? safeErrorDetails(failure) : {}) });
      } else if (response.status === 401 || response.status === 403) {
        logger.warn("api.access_denied", fields);
      } else if (response.status === 429) {
        // The limiter logs the first rejection per bucket/window, avoiding spam.
      } else if (response.status >= 400) {
        logger.debug("api.rejected", fields);
      } else if (fields.elapsedMs >= 5000) {
        logger.warn("api.slow", fields);
      }
      const headers = new Headers(response.headers);
      headers.set("X-Request-ID", context.requestId);
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    });
  };
}

function sendError(error: AppError) {
  const errorResponse = {
    status: error.status,
    message: error.isOperational
      ? error.message
      : "Uh oh! Something went wrong",
    errors: error.isOperational ? error.errors : [],
    stack: error.stack,
  };

  // Add error stack response only in development mode
  process.env.NODE_ENV !== config.envs.dev && delete errorResponse.stack;

  return Response.json(errorResponse, {
    status: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    ...(error.retryAfter ? { headers: { "Retry-After": String(error.retryAfter) } } : {}),
  });
}
/**
 * Checks for expected errors.
 * If error is known then mutated error is returned with extra properties such as isOperational, statusCode, status etc.
 * Returns unmutated error object if error is unknown
 * @param {AppError} error
 */
function markOperationalError(error: AppError): AppError {
  if (
    error.name === "SyntaxError" &&
    (error.message.includes("Unexpected token") ||
      error.message.includes("Unexpected end of JSON input"))
  )
    error = OE.handleSyntaxError(error);

  if (error.name === "ValidationError" && error.errors)
    error = OE.handleMongooseValidationError(error);

  if (error.kind === "ObjectId" && error.path && error.value)
    error = OE.handleCastErrorDB(error);

  if (error.name === "MongoServerError" && error.code === 11000)
    error = OE.handleDuplicateFieldsDB(error);

  if (error.message.includes("Invalid _id"))
    error = OE.handleInvalidMongooseId(error);

  return error;
}
