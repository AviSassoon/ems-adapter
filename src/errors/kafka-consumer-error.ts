import { HttpStatusCode } from '../utils/http-status-code.enum';
import { AppError } from './app-error';

export class KafkaConsumerError extends AppError {
  constructor(description: string = 'Kafka consumer error', error?: Error) {
    super(
      'KafkaConsumerError',
      HttpStatusCode.INTERNAL_SERVER,
      description,
      true,
      error,
    );
  }
}
