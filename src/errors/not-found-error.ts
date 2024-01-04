import { HttpStatusCode } from '../utils/http-status-code.enum';
import { AppError } from './app-error';

export class NotFoundError extends AppError {
  constructor(description: string = 'Not Found') {
    super('NotFoundError', HttpStatusCode.NOT_FOUND, description, true);
  }
}
