import { HttpStatusCode } from '../utils/http-status-code.enum';
import { AppError } from './app-error';

export class RedisError extends AppError {
  constructor(description: string = 'Redis Error', error?: Error) {
    super(
      'RedisError',
      HttpStatusCode.INTERNAL_SERVER,
      description,
      true,
      error,
    );
  }
}
