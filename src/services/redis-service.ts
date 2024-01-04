import { RedisClientType, WatchError, createClient } from 'redis';
import { EchoMessage } from '../models/echo-message';
import { RedisError } from '../errors/redis-error';
import logger from '../utils/logger';

const redisUrl = process.env.REDIS_URL;

class RedisService {
  private client: RedisClientType;
  private configurationsSet = 'configurations';

  constructor() {
    this.isUrlSet(redisUrl);
    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });

    this.client.on('error', (error) => {
      logger.error(error, 'Could not connect to Redis');
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async add(echoMessage: EchoMessage) {
    try {
      await this.client.zAdd(this.configurationsSet, {
        score: echoMessage.time,
        value: echoMessage.message,
      });
    } catch (error) {
      throw new RedisError('Failed to add message', error as Error);
    }
  }

  async executePrintAndRemove() {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const replies = await this.client
        .multi()
        .zRangeByScore(this.configurationsSet, 0, timestamp)
        .zRemRangeByScore(this.configurationsSet, 0, timestamp)
        .exec();

      const messages = replies[0] as unknown as EchoMessage[];
      if (messages.length > 0) {
        messages.forEach((message) => logger.info(message));
      }
    } catch (error) {
      if (error instanceof WatchError) {
        return logger.error('Execution Aborted');
      }
      throw new RedisError(
        'Something went wrong when trying to execute redis print and remove',
        error as Error,
      );
    }
  }

  private isUrlSet(url: string | undefined) {
    if (!url) {
      logger.error('Redis URL is not set.');
      throw new RedisError('Redis URL is not set.');
    }
  }
}

export const redisService = new RedisService();
