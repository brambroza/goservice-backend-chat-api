import axios from 'axios';
import { AppConfig } from '../config/env';

export class MlClient {
  constructor(private readonly config: AppConfig) {}

  async classifyChat(message: string, history: any[] = []) {
    const url = `${this.config.mlBase ?? this.config.kafka.clientId}/api/classify/chat`;
    // If mlBase not in env, fall back to configured ML upstream via env (reuse KAFKA client id variable? placeholder)
    try {
      const { data } = await axios.post(url, { message, history });
      return data;
    } catch (e) {
      return { intent: 'INCIDENT', urgency: 'high', sentiment: 'negative', confidence: 0.5 };
    }
  }
}
