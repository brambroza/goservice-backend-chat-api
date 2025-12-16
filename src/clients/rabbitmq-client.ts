import amqplib, { Connection, Channel } from 'amqplib';
import { AppConfig } from '../config/env';

export class RabbitMQClient {
  private connection?: Connection;
  private channel?: Channel;

  constructor(private readonly config: AppConfig) {}

  private async ensureChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    this.connection = await amqplib.connect(this.config.rabbitmq.uri);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.config.rabbitmq.exchange, 'direct', { durable: true });
    return this.channel;
  }

  async publish(message: Record<string, any>) {
    const channel = await this.ensureChannel();
    channel.publish(
      this.config.rabbitmq.exchange,
      this.config.rabbitmq.routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }
}
