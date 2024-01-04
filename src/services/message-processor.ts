import { IMessageProcessor } from '../models/message-processor';

export const messageProcessor: IMessageProcessor = {
  async process(value: string): Promise<void> {
    // Process the message and return the result
    console.log(`Processing message: ${value}`);
  },
};
