import {
  Consumer,
  ConsumerSubscribeTopics,
  Kafka,
  EachMessagePayload,
} from 'kafkajs';
import logger from '../../utils/logger';
import { kafkaConsumerConfig } from './kafka-consumer-config';
import { ConsumerEvents } from './consumer-events';

interface ExampleMessageProcessor {
  process(value: string): object;
}
export class KafkaConsumer {
  private static instance: Consumer;
  private messageProcessor: ExampleMessageProcessor;

  // public constructor(messageProcessor: ExampleMessageProcessor) {
  //   this.messageProcessor = messageProcessor;
  //   this.kafkaConsumer = this.createKafkaConsumer();
  // }

  public static getInstance() {
    if (!KafkaConsumer.instance) {
      KafkaConsumer.instance = KafkaConsumer.createKafkaConsumer();
      KafkaConsumer.setupEventHandlers();
    }
    return KafkaConsumer.instance;
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

  public async start(): Promise<void> {
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
            this.messageProcessor.process(message.value.toString());
          }
        },
      });
    } catch (error) {
      logger.error('Error: ', error);
    }
  }

  public async shutdown(): Promise<void> {
    await KafkaConsumer.instance.disconnect();
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
