import { Logger } from 'pino';

export interface LineMessage {
  userId: string;
  text: string;
}

export class LineAdapter {
  constructor(private readonly logger: Logger) {}

  async handle(message: LineMessage) {
    this.logger.info({ provider: 'line', message }, 'Handling LINE message');
    return { provider: 'line', userId: message.userId, text: message.text };
  }
}
