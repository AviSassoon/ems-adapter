import {
  Kafka,
  Message as KafkaMessage,
  Producer,
  ProducerRecord,
} from 'kafkajs';
import { kafkaProducerConfig } from './kafka-producer-config';
import { CustomMessageFormat } from './custom-message-format';
import { ProducerEvents } from './producer-events';
import logger from '../../utils/logger';
import { KafkaProducerError } from '../../errors/kafka-producer-error';

export class KafkaProducer {
  private static instance: Producer;

  private constructor() {}

  private static async initializeProducer() {
    const kafka = new Kafka(kafkaProducerConfig);
    KafkaProducer.instance = kafka.producer();
    KafkaProducer.setupEventHandlers();
  }

  private static setupEventHandlers() {
    KafkaProducer.instance.on(ProducerEvents.CONNECT, () =>
      logger.info('Producer connected'),
    );
    KafkaProducer.instance.on(ProducerEvents.DISCONNECT, () =>
      logger.info('Producer disconnected'),
    );
    KafkaProducer.instance.on(ProducerEvents.REQUEST, (e) =>
      logger.info(`Producer network request: ${JSON.stringify(e)}`),
    );
    KafkaProducer.instance.on(ProducerEvents.REQUEST_TIMEOUT, (e) =>
      logger.info(`Producer request timeout: ${JSON.stringify(e)}`),
    );
  }

  public static async start(): Promise<void> {
    if (!KafkaProducer.instance) {
      await KafkaProducer.initializeProducer();
    }

    try {
      await KafkaProducer.instance.connect();
    } catch (error) {
      logger.error('Error connecting the producer: ', error);
      throw new KafkaProducerError(
        'Error connecting the producer',
        error as Error,
      );
    }
  }

  public static async shutdown(): Promise<void> {
    if (!KafkaProducer.instance) {
      throw new KafkaProducerError('Producer is not initialized');
    }

    try {
      await KafkaProducer.instance.disconnect();
    } catch (error) {
      logger.error('Error disconnecting the producer: ', error);
      throw new KafkaProducerError(
        'Error disconnecting the producer',
        error as Error,
      );
    }
  }

  public static async send(messages: CustomMessageFormat[]): Promise<void> {
    if (!KafkaProducer.instance) {
      throw new KafkaProducerError('Producer is not initialized');
    }

    try {
      const kafkaMessages: KafkaMessage[] = messages.map((message) => {
        return {
          value: JSON.stringify(message.data),
        };
      });

      const record: ProducerRecord = {
        topic: 'producer-topic',
        messages: kafkaMessages,
      };

      await KafkaProducer.instance.send(record);
    } catch (error) {
      logger.error('Error sending record: ', error);
      throw new KafkaProducerError('Error sending record', error as Error);
    }
  }
}
