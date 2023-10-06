import { config } from "@/config";
import AppError from "../appError";
import OE from "./operationalErrors";
import { StatusCodes } from "http-status-codes";

export default function catchAsync(
  asyncFunction: (req: Request) => Promise<Response>
) {
  return async (req: Request) => {
    try {
      return await asyncFunction(req);
    } catch (error: any) {
      return sendError(error);
    }
  };
}

function sendError(error: AppError) {
  error = markOperationalError(error);

  const errorResponse = {
    status: error.status,
    message: error.isOperational ? error.message : "Something went wrong",
    errors: error.isOperational ? error.errors : [],
    stack: error.stack,
  };

  // Add error stack response only in development mode
  process.env.NODE_ENV !== config.ENVS.DEV && delete errorResponse.stack;

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
