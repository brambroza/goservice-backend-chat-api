import IORedis from 'ioredis';
import { AppConfig } from '../config/env';

export class RedisClient {
  private client: IORedis;

  constructor(config: AppConfig) {
    this.client = new IORedis(config.redis.url, {
      password: config.redis.password || undefined,
    });
  }

  async set(key: string, value: any, ttlSeconds = 300) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }
}
