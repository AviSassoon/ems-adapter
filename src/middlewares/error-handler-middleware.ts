import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { HttpStatusCode } from '../utils/http-status-code.enum';

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.httpCode).send({ error: err.message });
  }

  res
    .status(HttpStatusCode.INTERNAL_SERVER)
    .json({ error: 'something went wrong!' });
};
