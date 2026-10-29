import { config } from "@/config";
import AppError from "../appError";
import OE from "./operationalErrors";
import { StatusCodes } from "http-status-codes";
import { NextRequest } from "next/server";
import logger from "@/utils/logger";

export default function catchAsync(
  asyncFunction: (req: NextRequest, data?: any) => Promise<Response>
) {
  return async (req: NextRequest, data?: any) => {
    const started = Date.now();
    const request = { method: req.method, path: new URL(req.url).pathname };
    logger.info("api.request.started", request);
    let response: Response;
    try {
      response = await asyncFunction(req, data);
    } catch (error: any) {
      // Raw driver/validation errors can contain credentials or account data.
      logger.error("api.error", {
        ...request,
        errorName: error?.name,
        errorCode: typeof error?.code === "number" ? error.code : undefined,
      });
      response = sendError(error);
    }
    logger.log(response.status >= 500 ? "error" : response.status >= 400 ? "warn" : "info", "api.request.completed", {
      ...request,
      status: response.status,
      elapsedMs: Date.now() - started,
    });
    return response;
  };
}

function sendError(error: AppError) {
  error = markOperationalError(error);

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
