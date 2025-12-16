import { Logger } from 'pino';
import { LineClient } from '../clients/line-client';
import { KafkaClient } from '../clients/kafka-client';
import { RabbitMQClient } from '../clients/rabbitmq-client';
import { RedisClient } from '../clients/redis-client';

export class LineService {
  constructor(
    private readonly client: LineClient,
    private readonly logger: Logger,
    private readonly kafka: KafkaClient,
    private readonly rabbit: RabbitMQClient,
    private readonly redis: RedisClient,
  ) {}

  async handleWebhook(body: any) {
    this.logger.info({ body }, 'Received LINE webhook');
    const events = body.events ?? [];
    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        await this.client.reply(event.replyToken, [{ type: 'text', text: 'Acknowledged' }]);
        await this.kafka.send('integration.events', {
          provider: 'line',
          type: 'message.received',
          body: event,
          at: new Date().toISOString(),
        });
        await this.rabbit.publish({
          provider: 'line',
          type: 'message.received',
          body: event,
          at: new Date().toISOString(),
        });
        await this.redis.set(
          `line:last:${event.source?.userId ?? 'unknown'}`,
          event,
          300,
        );
      }
    }
    return { received: events.length };
  }
}
