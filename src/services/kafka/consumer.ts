import {
  Consumer,
  ConsumerSubscribeTopics,
  Kafka,
  EachMessagePayload,
} from 'kafkajs';
import logger from '../../utils/logger';
import { kafkaConsumerConfig } from './kafka-consumer-config';
import { ConsumerEvents } from './consumer-events';
import { KafkaConsumerError } from '../../errors/kafka-consumer-error';

interface ExampleMessageProcessor {
  process(value: string): Promise<object>;
}
export class KafkaConsumer {
  private static instance: Consumer;
  private static messageProcessor: ExampleMessageProcessor | null = null;

  private constructor() {}

  private static async initializeConsumer(
    messageProcessor: ExampleMessageProcessor,
  ) {
    KafkaConsumer.instance = KafkaConsumer.createKafkaConsumer();
    KafkaConsumer.setupEventHandlers();
    KafkaConsumer.messageProcessor = messageProcessor;
  }

  private static setupEventHandlers() {
    KafkaConsumer.instance.on(ConsumerEvents.CONNECT, () =>
      logger.info('Consumer connected'),
    );
    KafkaConsumer.instance.on(ConsumerEvents.DISCONNECT, () =>
      logger.info('Consumer disconnected'),
    );
    KafkaConsumer.instance.on(ConsumerEvents.FETCH, () =>
      logger.info('Consumer Fetch'),
    );
    KafkaConsumer.instance.on(ConsumerEvents.CRASH, () =>
      logger.info('Consumer Crash'),
    );
    KafkaConsumer.instance.on(ConsumerEvents.REQUEST, (e) =>
      logger.info(`Consumer network request: ${JSON.stringify(e)}`),
    );
    KafkaConsumer.instance.on(ConsumerEvents.REQUEST_TIMEOUT, (e) =>
      logger.info(`Consumer request timeout: ${JSON.stringify(e)}`),
    );
  }

  public async start(messageProcessor: ExampleMessageProcessor): Promise<void> {
    if (!KafkaConsumer.instance) {
      await KafkaConsumer.initializeConsumer(messageProcessor);
    }

    // Check CONSUMER_TOPIC_NAME
    const topic: ConsumerSubscribeTopics = {
      topics: [process.env.CONSUMER_TOPIC_NAME!],
      fromBeginning: false,
    };

    try {
      await KafkaConsumer.instance.connect();
      await KafkaConsumer.instance.subscribe(topic);

      await KafkaConsumer.instance.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload;
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
          logger.info(`- ${prefix} ${message.key}#${message.value}`);

          if (message.value) {
            await KafkaConsumer.messageProcessor!.process(
              message.value.toString(),
            );
          }
        },
      });
    } catch (error) {
      logger.error('Error: ', error);
    }
  }

  public async shutdown(): Promise<void> {
    if (!KafkaConsumer.instance) {
      throw new KafkaConsumerError('Consumer is not initialized');
    }

    try {
      await KafkaConsumer.instance.disconnect();
    } catch (error) {
      logger.error('Error disconnecting the consumer: ', error);
      throw new KafkaConsumerError(
        'Error disconnecting the consumer',
        error as Error,
      );
    }
  }

  private static createKafkaConsumer(): Consumer {
    // Check CLIENT_ID and KAFKA_BROKER_CONSUMER
    const kafka = new Kafka(kafkaConsumerConfig);
    // Check CONSUMER_GROUP_ID

    const consumer = kafka.consumer({
      groupId: process.env.CONSUMER_GROUP_ID!,
    });
    return consumer;
  }
}
