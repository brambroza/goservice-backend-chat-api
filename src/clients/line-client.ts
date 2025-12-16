import axios from 'axios';

export class LineClient {
  constructor(private readonly channelAccessToken: string) {}

  async reply(replyToken: string, messages: Array<{ type: string; text: string }>) {
    await axios.post(
      'https://api.line.me/v2/bot/message/reply',
      { replyToken, messages },
      { headers: { Authorization: `Bearer ${this.channelAccessToken}` } },
    );
  }
}
