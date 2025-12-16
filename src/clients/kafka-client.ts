import { Kafka, Producer } from 'kafkajs';
import { AppConfig } from '../config/env';

export class KafkaClient {
  private producer: Producer;
  private connected = false;

  constructor(private readonly config: AppConfig) {
    const kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      ssl: config.kafka.ssl,
      sasl:
        config.kafka.username && config.kafka.password
          ? {
              mechanism: config.kafka.mechanism as any,
              username: config.kafka.username,
              password: config.kafka.password,
            }
          : undefined,
    });
    this.producer = kafka.producer();
  }

  async send(topic: string, payload: Record<string, any>) {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  }
}
