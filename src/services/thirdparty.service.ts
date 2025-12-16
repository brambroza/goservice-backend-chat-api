import { Logger } from 'pino';
import { KafkaClient } from '../clients/kafka-client';
import { RabbitMQClient } from '../clients/rabbitmq-client';
import { RedisClient } from '../clients/redis-client';

export class ThirdPartyService {
  constructor(
    private readonly logger: Logger,
    private readonly kafka: KafkaClient,
    private readonly rabbit: RabbitMQClient,
    private readonly redis: RedisClient,
  ) {}

  async handleWebhook(body: any) {
    this.logger.info({ body }, 'Received third-party webhook');
    await this.kafka.send('integration.events', {
      type: 'thirdparty.webhook',
      body,
      at: new Date().toISOString(),
    });
    await this.rabbit.publish({
      type: 'thirdparty.webhook',
      body,
      at: new Date().toISOString(),
    });
    await this.redis.set('thirdparty:last', body, 300);
    return { status: 'ok' };
  }
}
