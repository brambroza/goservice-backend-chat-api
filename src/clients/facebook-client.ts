import axios from 'axios';

export class FacebookClient {
  constructor(private readonly pageAccessToken: string) {}

  async sendText(recipientId: string, text: string) {
    await axios.post(
      'https://graph.facebook.com/v18.0/me/messages',
      {
        messaging_type: 'RESPONSE',
        recipient: { id: recipientId },
        message: { text },
      },
      {
        params: { access_token: this.pageAccessToken },
      },
    );
  }
}
