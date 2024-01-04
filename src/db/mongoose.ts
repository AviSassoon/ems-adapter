import mongoose from 'mongoose';
import { DatabaseError } from '../errors/database-error';
import { DatabaseEvents } from './database-events';
import logger from '../utils/logger';
export class Database {
  private static instance: mongoose.Connection | null = null;

  private constructor() {}

  public static async connect(): Promise<void> {
    if (Database.isValidConnection()) return;

    const dbUrl = process.env.DB_URL;
    Database.isUrlSet(dbUrl);

    try {
      const connection = await mongoose.connect(dbUrl!);
      Database.instance = connection.connection;

      if (!Database.isValidConnection) {
        throw new DatabaseError('Database instance is not initialized.');
      }

      Database.setupEventHandlers();

      logger.info('Database connected!');
    } catch (error) {
      logger.error(error, 'MongoDB connection error:');
      throw new DatabaseError(
        `Failed to connect to the database`,
        error as Error,
      );
    }
  }

  public static async disconnect(): Promise<void> {
    if (!Database.isValidConnection()) return;

    try {
      await Database.instance!.close();
      Database.instance = null;
      logger.info('Database disconnected!');
    } catch (error) {
      logger.error(error, 'MongoDB disconnecting error:');
      throw new DatabaseError(
        'Failed to disconnect from the database',
        error as Error,
      );
    }
  }

  private static setupEventHandlers() {
    Database.instance!.on(DatabaseEvents.CONNECTED, () =>
      logger.info('Database connected.'),
    );

    Database.instance!.on(DatabaseEvents.OPEN, () =>
      logger.info('Database connection opened.'),
    );

    Database.instance!.on(DatabaseEvents.DISCONNECTED, () =>
      logger.info('Database disconnected.'),
    );

    Database.instance!.on(DatabaseEvents.RECONNECTED, () =>
      logger.info('Database reconnected.'),
    );

    Database.instance!.on(DatabaseEvents.DISCONNECTING, () =>
      logger.info('Database is disconnecting...'),
    );

    Database.instance!.on(DatabaseEvents.CLOSE, () => {
      logger.error('Database connection close.');
    });
  }

  private static isValidConnection() {
    return !!Database.instance;
  }

  private static isUrlSet(dbUrl: string | undefined) {
    if (!dbUrl) {
      logger.error('Database connection URL is not set.');
      throw new DatabaseError('Database connection URL is not set.');
    }
  }
}
