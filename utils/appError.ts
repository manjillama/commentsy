class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  // External error properties
  path?: string;
  errors?: string[];
  value?: string;
  kind?: string;
  field?: string;
  code?: number | string;

  constructor(message: string, statusCode: number, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // setting a flag so that we can know the error is created using this class
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;
