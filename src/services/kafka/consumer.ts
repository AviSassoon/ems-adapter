import {
  Consumer,
  ConsumerSubscribeTopics,
  Kafka,
  EachMessagePayload,
} from 'kafkajs';
import logger from '../../utils/logger';

interface ExampleMessageProcessor {
  process(): object;
}
export class KafkaConsumer {
  private kafkaConsumer: Consumer;
  private messageProcessor: ExampleMessageProcessor;

  public constructor(messageProcessor: ExampleMessageProcessor) {
    this.messageProcessor = messageProcessor;
    this.kafkaConsumer = this.createKafkaConsumer();
  }

  public async startConsumer(): Promise<void> {
    // Check CONSUMER_TOPIC_NAME
    const topic: ConsumerSubscribeTopics = {
      topics: [process.env.CONSUMER_TOPIC_NAME!],
      fromBeginning: false,
    };

    try {
      await this.kafkaConsumer.connect();
      await this.kafkaConsumer.subscribe(topic);

      await this.kafkaConsumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload;
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
          logger.info(`- ${prefix} ${message.key}#${message.value}`);
        },
      });
    } catch (error) {
      logger.error('Error: ', error);
    }
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect();
  }

  private createKafkaConsumer(): Consumer {
    // Check CLIENT_ID and KAFKA_BROKER_CONSUMER
    const kafka = new Kafka({
      clientId: process.env.CLIENT_ID,
      brokers: [process.env.KAFKA_BROKER_CONSUMER!],
    });
    // Check CONSUMER_GROUP_ID

    const consumer = kafka.consumer({
      groupId: process.env.CONSUMER_GROUP_ID!,
    });
    return consumer;
  }
}
