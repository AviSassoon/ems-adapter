import { KafkaConfig, SASLOptions } from 'kafkajs';

const kafkaConfig: KafkaConfig = {
  clientId: <string>process.env.CLIENT_ID,
  brokers: [<string>process.env.KAFKA_BROKER],
  sasl: {
    username: <string>process.env.SASL_USERNAME,
    password: <string>process.env.SASL_PASSWORD,
    mechanism: <string>process.env.SASL_MECHANISMS,
  } as SASLOptions,
};

export default kafkaConfig;
