export interface IMessageProcessor {
  process(value: string): Promise<void>;
}
