import Joi from 'joi';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  logLevel: string;
  lineChannelSecret: string;
  lineChannelAccessToken: string;
  fbAppSecret: string;
  fbPageAccessToken: string;
  fbVerifyToken: string;
  thirdPartyWebhookSecret: string;
  kafka: {
    brokers: string[];
    clientId: string;
    username?: string;
    password?: string;
    mechanism: string;
    ssl: boolean;
  };
  rabbitmq: {
    uri: string;
    exchange: string;
    routingKey: string;
  };
  redis: {
    url: string;
    password?: string;
  };
  mlBase?: string;
}

const schema = Joi.object({
  PORT: Joi.number().default(8082),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  LOG_LEVEL: Joi.string().default('info'),
  LINE_CHANNEL_SECRET: Joi.string().required(),
  LINE_CHANNEL_ACCESS_TOKEN: Joi.string().required(),
  FB_APP_SECRET: Joi.string().required(),
  FB_PAGE_ACCESS_TOKEN: Joi.string().required(),
  FB_VERIFY_TOKEN: Joi.string().required(),
  THIRD_PARTY_WEBHOOK_SECRET: Joi.string().required(),
  KAFKA_BROKERS: Joi.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: Joi.string().default('chat-api'),
  KAFKA_SASL_USERNAME: Joi.string().optional(),
  KAFKA_SASL_PASSWORD: Joi.string().optional(),
  KAFKA_SASL_MECHANISM: Joi.string().valid('plain', 'scram-sha-256', 'scram-sha-512').default('plain'),
  KAFKA_SSL: Joi.boolean().default(false),
  RABBITMQ_URI: Joi.string().default('amqp://guest:guest@localhost:5672'),
  RABBITMQ_EXCHANGE: Joi.string().default('platform.direct'),
  RABBITMQ_ROUTING_KEY: Joi.string().default('integration.tasks'),
  REDIS_URL: Joi.string().uri().default('redis://localhost:6379/0'),
  REDIS_PASSWORD: Joi.string().allow('', null),
  ML_BASE: Joi.string().uri().optional(),
});

export function loadConfig(): AppConfig {
  const { value, error } = schema.prefs({ errors: { label: 'key' } }).validate(process.env);
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    port: value.PORT,
    nodeEnv: value.NODE_ENV,
    logLevel: value.LOG_LEVEL,
    lineChannelSecret: value.LINE_CHANNEL_SECRET,
    lineChannelAccessToken: value.LINE_CHANNEL_ACCESS_TOKEN,
    fbAppSecret: value.FB_APP_SECRET,
    fbPageAccessToken: value.FB_PAGE_ACCESS_TOKEN,
    fbVerifyToken: value.FB_VERIFY_TOKEN,
    thirdPartyWebhookSecret: value.THIRD_PARTY_WEBHOOK_SECRET,
    kafka: {
      brokers: (value.KAFKA_BROKERS as string).split(','),
      clientId: value.KAFKA_CLIENT_ID,
      username: value.KAFKA_SASL_USERNAME,
      password: value.KAFKA_SASL_PASSWORD,
      mechanism: value.KAFKA_SASL_MECHANISM,
      ssl: value.KAFKA_SSL,
    },
    rabbitmq: {
      uri: value.RABBITMQ_URI,
      exchange: value.RABBITMQ_EXCHANGE,
      routingKey: value.RABBITMQ_ROUTING_KEY,
    },
    redis: {
      url: value.REDIS_URL,
      password: value.REDIS_PASSWORD,
    },
    mlBase: value.ML_BASE,
  };
}
