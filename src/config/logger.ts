import pino from 'pino';
import { AppConfig } from './env';

export function createLogger(config: AppConfig) {
  return pino({
    name: 'chat-api',
    level: config.logLevel,
    transport: config.nodeEnv === 'development'
      ? { target: 'pino-pretty', options: { translateTime: true } }
      : undefined,
  });
}
