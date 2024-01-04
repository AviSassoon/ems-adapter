import { KafkaConfig, SASLOptions } from 'kafkajs';

export const kafkaConsumerConfig: KafkaConfig = {
  clientId: <string>process.env.CLIENT_ID,
  brokers: [<string>process.env.KAFKA_CONSUMER_BROKER],
  sasl: {
    username: <string>process.env.CONSUMER_SASL_USERNAME,
    password: <string>process.env.CONSUMER_SASL_PASSWORD,
    mechanism: <string>process.env.CONSUMER_SASL_MECHANISMS,
  } as SASLOptions,
};
