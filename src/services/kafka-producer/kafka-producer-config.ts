import { KafkaConfig, SASLOptions } from 'kafkajs';

export const kafkaProducerConfig: KafkaConfig = {
  clientId: <string>process.env.CLIENT_ID,
  brokers: [<string>process.env.KAFKA_PRODUCER_BROKER],
  sasl: {
    username: <string>process.env.PRODUCER_SASL_USERNAME,
    password: <string>process.env.PRODUCER_SASL_PASSWORD,
    mechanism: <string>process.env.PRODUCER_SASL_MECHANISMS,
  } as SASLOptions,
};
