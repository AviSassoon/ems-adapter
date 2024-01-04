import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import { Database } from './db/mongoose';
import { errorHandlerMiddleware } from './middlewares/error-handler-middleware';
import healthCheck from './routers/health-check.router';
import { KafkaProducer } from './services/kafka-producer/kafka-producer';
import { KafkaConsumer } from './services/kafka-consumer/kafka-consumer';
import { messageProcessor } from './services/message-processor';
import { NotFoundError } from './errors/not-found-error';
import { fillConfigurationCache } from './utils/app-initialization';
import logger from './utils/logger';

let server: http.Server;

const startServer = async () => {
  try {
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(healthCheck);
    app.use(errorHandlerMiddleware);

    app.all('*', async (req: Request, res: Response, next: NextFunction) => {
      next(new NotFoundError());
    });

    const port = process.env.PORT || 3000;
    await Database.connect();
    await KafkaProducer.start();
    await KafkaConsumer.start(messageProcessor);
    await fillConfigurationCache();

    server = app.listen(port, () => {
      logger.info(`Server is running at port: ${port}`);
    });
  } catch (error) {
    logger.error(error, 'Error starting the server');
  }
};

process
  .on('unhandledRejection', async (error: Error, promise) => {
    await KafkaProducer.shutdown();
    await KafkaConsumer.shutdown();
    await Database.disconnect();

    logger.error(error, 'Unhandled Rejection at', promise);
    process.exit(1);
  })
  .on('uncaughtException', async (error) => {
    await KafkaProducer.shutdown();
    await KafkaConsumer.shutdown();
    await Database.disconnect();

    logger.error(error, 'Uncaught Exception thrown');
    process.exit(1);
  });

startServer();

const gracefulShutdownHandler = (signal: string) => {
  logger.warn(`Caught ${signal}, gracefully shutting down`);

  setTimeout(async () => {
    logger.info('Shutting down application');

    await KafkaProducer.shutdown();
    await KafkaConsumer.shutdown();

    await Database.disconnect();

    server.close(() => {
      logger.info('👋 All requests stopped, shutting down');
      process.exit();
    });
  }, 0);
};

process.on('SIGINT', gracefulShutdownHandler);
process.on('SIGTERM', gracefulShutdownHandler);
