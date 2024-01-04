import { HttpStatusCode } from '../utils/http-status-code.enum';

export abstract class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly originalError?: Error;

  protected constructor(
    name: string,
    httpCode: HttpStatusCode,
    description: string,
    isOperational: boolean,
    originalError?: Error,
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.originalError = originalError;

    Error.captureStackTrace(this);
  }
}
