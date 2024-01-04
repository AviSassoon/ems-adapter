export enum ProducerEvents {
  CONNECT = 'producer.connect',
  DISCONNECT = 'producer.disconnect',
  REQUEST = 'producer.network.request',
  REQUEST_TIMEOUT = 'producer.network.request_timeout',
  REQUEST_QUEUE_SIZE = 'producer.network.request_queue_size',
}
