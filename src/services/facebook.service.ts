import { Logger } from 'pino';
import { FacebookClient } from '../clients/facebook-client';
import { KafkaClient } from '../clients/kafka-client';
import { RabbitMQClient } from '../clients/rabbitmq-client';
import { RedisClient } from '../clients/redis-client';

export class FacebookService {
  constructor(
    private readonly client: FacebookClient,
    private readonly logger: Logger,
    private readonly kafka: KafkaClient,
    private readonly rabbit: RabbitMQClient,
    private readonly redis: RedisClient,
  ) {}

  async handleWebhook(body: any) {
    this.logger.info({ body }, 'Received FB webhook');
    const entries = body.entry ?? [];
    let count = 0;
    for (const entry of entries) {
      for (const messaging of entry.messaging ?? []) {
        const senderId = messaging.sender?.id;
        const text = messaging.message?.text;
        if (senderId && text) {
          await this.client.sendText(senderId, 'Received: ' + text);
          count += 1;
          await this.kafka.send('integration.events', {
            provider: 'facebook',
            type: 'message.received',
            body: messaging,
            at: new Date().toISOString(),
          });
          await this.rabbit.publish({
            provider: 'facebook',
            type: 'message.received',
            body: messaging,
            at: new Date().toISOString(),
          });
          await this.redis.set(`fb:last:${senderId}`, messaging, 300);
        }
      }
    }
    return { received: count };
  }
}
