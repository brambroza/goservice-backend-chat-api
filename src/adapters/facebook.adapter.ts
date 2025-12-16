import { Logger } from 'pino';

export interface FacebookMessage {
  senderId: string;
  text: string;
}

export class FacebookAdapter {
  constructor(private readonly logger: Logger) {}

  async handle(message: FacebookMessage) {
    this.logger.info({ provider: 'facebook', message }, 'Handling FB message');
    return { provider: 'facebook', userId: message.senderId, text: message.text };
  }
}
