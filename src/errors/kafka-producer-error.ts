import { HttpStatusCode } from '../utils/http-status-code.enum';
import { AppError } from './app-error';

export class KafkaProducerError extends AppError {
  constructor(description: string = 'Kafka producer error', error?: Error) {
    super(
      'KafkaProducerError',
      HttpStatusCode.INTERNAL_SERVER,
      description,
      true,
      error,
    );
  }
}
