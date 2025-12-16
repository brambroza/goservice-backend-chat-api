import axios from 'axios';
import { AppConfig } from '../config/env';

export class NestClient {
  private readonly base: string;
  private readonly token?: string;

  constructor(private readonly config: AppConfig) {
    this.base = process.env.NEST_API_BASE || 'http://localhost:3000/api';
    this.token = process.env.NEST_SERVICE_TOKEN;
  }

  async createTicket(payload: {
    title: string;
    description: string;
    customerId?: string;
    metadata?: any;
  }) {
    const { data } = await axios.post(`${this.base}/tickets`, payload, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    return data;
  }
}
