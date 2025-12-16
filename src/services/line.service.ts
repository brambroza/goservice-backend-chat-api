import { Logger } from 'pino';
import { LineClient } from '../clients/line-client';
import { KafkaClient } from '../clients/kafka-client';
import { RabbitMQClient } from '../clients/rabbitmq-client';
import { RedisClient } from '../clients/redis-client';
import { MlClient } from '../clients/ml-client';
import { NestClient } from '../clients/nest-client';

export class LineService {
  constructor(
    private readonly client: LineClient,
    private readonly logger: Logger,
    private readonly kafka: KafkaClient,
    private readonly rabbit: RabbitMQClient,
    private readonly redis: RedisClient,
    private readonly ml: MlClient,
    private readonly nest: NestClient,
  ) {}

  async handleWebhook(body: any) {
    this.logger.info({ body }, 'Received LINE webhook');
    const events = body.events ?? [];
    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        const text = event.message.text;
        const classification = await this.ml.classifyChat(text, []);
        const providerPayload = {
          provider: 'line',
          type: 'message.received',
          body: event,
          at: new Date().toISOString(),
          classification,
        };
        if (classification.intent === 'FAQ' && (classification.confidence ?? 0) > 0.7) {
          await this.client.reply(event.replyToken, [{ type: 'text', text: classification.suggestedReply || 'ให้ข้อมูลเพิ่มเติมได้เลยค่ะ' }]);
        } else {
          // create ticket via Nest BFF
          const ticket = await this.nest.createTicket({
            title: text.slice(0, 60),
            description: text,
            customerId: event.source?.userId,
            metadata: classification,
          });
          await this.client.reply(event.replyToken, [
            { type: 'text', text: `ระบบสร้าง Ticket ${ticket?.id ?? ''} ให้แล้วค่ะ` },
          ]);
        }
        await this.kafka.send('integration.events', providerPayload);
        await this.rabbit.publish(providerPayload);
        await this.redis.set(`line:last:${event.source?.userId ?? 'unknown'}`, event, 300);
      }
    }
    return { received: events.length };
  }
}
