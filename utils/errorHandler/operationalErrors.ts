import { StatusCodes } from "http-status-codes";
import AppError from "../appError";

function handleSyntaxError(error: AppError): AppError {
  const message = `Invalid input data format`;
  return new AppError(message, StatusCodes.BAD_REQUEST, [message]);
}

function handleMongooseValidationError(error: AppError): AppError {
  const message = `Validation error`;
  const errors = Object.values(error.errors as any).map(
    (err: any) => err?.properties?.message || ""
  );
  return new AppError(message, StatusCodes.BAD_REQUEST, errors);
}

function handleCastErrorDB(error: AppError): AppError {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, StatusCodes.BAD_REQUEST, [message]);
}

function handleDuplicateFieldsDB(error: AppError): AppError {
  const details = error as AppError & { keyPattern?: Record<string, unknown>; keyValue?: Record<string, unknown> };
  const isEmail = Boolean(details.keyPattern?.email || details.keyValue?.email) || /index: email_/.test(error.message);
  const message = isEmail
    ? "An account with this email already exists. Sign in instead, or use one of the options below to recover access."
    : "This value is already in use. Please choose another.";
  return new AppError(message, StatusCodes.BAD_REQUEST, [message]);
}

function handleInvalidMongooseId(error: AppError): AppError {
  const message = `Invalid document id`;
  return new AppError(message, StatusCodes.BAD_REQUEST, [message]);
}

/**
 * @docs Operational errors
 */
export default {
  handleSyntaxError,
  handleMongooseValidationError,
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleInvalidMongooseId,
};
