import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost',
  },
});

export default logger;
