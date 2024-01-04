import { HttpStatusCode } from '../utils/http-status-code.enum';
import { AppError } from './app-error';

export class DatabaseError extends AppError {
  constructor(description: string = 'Database Error', error?: Error) {
    super(
      'DatabaseError',
      HttpStatusCode.INTERNAL_SERVER,
      description,
      true,
      error,
    );
  }
}
