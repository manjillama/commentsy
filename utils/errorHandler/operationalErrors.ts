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
  const duplicateField = error.message
    .split("index: ")[1]
    .split("dup key")[0]
    .split("_")[0];
  const message = `Duplicate field ${duplicateField}. Please use another value`;
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
